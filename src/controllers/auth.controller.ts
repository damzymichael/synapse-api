import { Request } from "express"
import { Controller } from "../lib/requestHandler.config"
import { hash, compare } from "bcryptjs"
import createHttpError from "http-errors"
import prisma from "../lib/db.connection"
import { SKILL_LEVEL } from "@prisma/client"
import jwt from "jsonwebtoken"
import env from "../lib/env"

interface UserSchema {
  email: string
  fullName: string
  password: string
  skillName: string
  skillLevel: SKILL_LEVEL
}

type Login = Pick<UserSchema, "email" | "password">

export default Controller({
  async register(req: Request<{}, {}, UserSchema>, res) {
    const { email, fullName, password, skillName, skillLevel } = req.body

    const exists = await prisma.user.findFirst({ where: { email } })

    if (exists) throw createHttpError(403, "Account already exists, please login")

    const hashedPW = await hash(password, 10)

    const user = await prisma.user.create({
      data: { email, fullName, password: hashedPW },
      select: { id: true },
    })

    if (skillName && skillLevel) {
      await prisma.skill.create({ data: { name: skillName, level: skillLevel, userId: user.id } })
    }

    const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, {
      expiresIn: "7d",
    })

    res.cookie("session.token", token, {
      signed: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in MS
      httpOnly: true, // prevent XSS attacks: cross-site scripting
      sameSite: "strict", // CSRF attacks
      secure: env.NODE_ENV === "development" ? false : true,
    })

    return res.status(201).json({ message: "Sign up successful" })
  },

  async login(req: Request<{}, {}, Login>, res) {
    const { email, password } = req.body

    const user = await prisma.user.findUnique({
      where: { email },
      select: { password: true, id: true },
    })

    if (!user) throw createHttpError(404, "Invalid credentials")

    const validPassword = await compare(password, user.password)

    if (!validPassword) throw createHttpError(403, "Invalid credentials")

    const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, {
      expiresIn: "7d",
    })

    res.cookie("session.token", token, {
      signed: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in MS
      httpOnly: true,
      sameSite: "strict",
      secure: env.NODE_ENV === "development" ? false : true,
    })

    return res.status(200).send({ message: "Login successful" })
  },

  async logout(req, res) {
    await req.logout()
    res.status(200).send({ message: "Logout successful" })
  },
})
