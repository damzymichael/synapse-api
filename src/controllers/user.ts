import express, { Request } from "express"
import { Controller } from "../util/requestHandler.config"
import { hash, compare } from "bcryptjs"
import createHttpError from "http-errors"
import crypto from "crypto"
import prisma from "../util/db.connection"

interface UserSchema {
  email: string
  fullName: string
  password: string
  skillName: string
  skillLevel: string
}

type Login = Pick<UserSchema, "email" | "password">

export default Controller({
  async register(req: Request<{}, {}, UserSchema>, res) {
    const { email, password, skillName, skillLevel } = req.body

    const exists = await prisma.user.findFirst({ where: { email } })

    if (exists) throw createHttpError(403, "Account already exists, please login")

    const hashedPW = await hash(password, 10)

    //* Add role of user by default
    const user = await prisma.user.create({ data: { ...req.body, password: hashedPW } })

    const { email: _email, id } = user

    return res.status(200).json({ message: "Sign up successful", userId: id })
  },

  async logout(req, res) {
    await req.logout()

    res.status(200).send("Logout successful")
  },

  // async verifyEmail(req: Request<{}, {}, Verify>, res) {
  //   const { code } = req.body

  //   const { id } = req.user

  //   const codeExists = await prisma.verficationCode.findUnique({
  //     where: { userId_action: { userId: id, action: "EMAIL_VERIFICATION" } },
  //   })

  //   if (!codeExists) throw createHttpError(403, "Code expired, request new code")

  //   if (codeExists.code !== code) throw createHttpError(403, "Invalid code, retry")

  //   await prisma.user.update({
  //     where: { id },
  //     data: { emailVerified: true },
  //   })

  //   await prisma.verficationCode.delete({ where: { id: codeExists.id } })

  //   return res.status(200).send("Email verification successful")
  // },

  //TODO Implement resending verification email flow
  async resendVerificationCode(req, res) {
    return res.status(200).json("Okay")
  },

  // async login(req: Request<{}, {}, Login, { admin: string }>, res) {
  //   const { email, password } = req.body

  //   const { admin } = req.query

  //   const user = await prisma.user.findUnique({ where: { email } })

  //   if (!user) throw createHttpError(403, "Invalid email or password")

  //   if (admin == "true" && user.role != "ADMIN") throw createHttpError(403, "Unknown Error Occured")

  //   const validPassword = await compare(password, user.password)

  //   if (!validPassword) throw createHttpError(403, "Invalid email or password")

  //   if (!user.emailVerified) throw createHttpError(403, "Please verify your email")

  //   const twoWeeks = new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000)

  //   const { password: _, emailVerified, role, updatedAt, ...rest } = user

  //   return res
  //     .cookie("session.token", "Token from JWT", {
  //       signed: true,
  //       maxAge: 1000 * 60 * 60 * 24 * 14,
  //       sameSite: "none",
  //       secure: true,
  //     })
  //     .status(200)
  //     .send("Login successful")
  // },

  // async sendPasswordResetMail(req: Request<{}, {}, ResetPasswordMail>, res) {
  //   const { email } = req.body

  //   const user = await prisma.user.findUnique({ where: { email } })

  //   if (!user) throw createHttpError(403, "User not found")

  //   const rand = crypto.randomInt(1000, 9999).toString()

  //   const otp = await prisma.verficationCode.create({
  //     data: {
  //       userId: user.id,
  //       code: rand,
  //       action: "PASSWORD_RESET",
  //     },
  //   })

  //   if (!otp) throw createHttpError(403, "Could not create verification code")

  //   return res.status(200).json("Password reset code sent to your mail")
  // },

  // async verifyPasswordResetCode(req: Request<{}, {}, Verify>, res) {
  //   const { code, userId } = req.body

  //   const otp = await prisma.verficationCode.findFirst({
  //     where: { code, userId, action: "PASSWORD_RESET" },
  //   })

  //   if (!otp) throw createHttpError(403, "Code expired, request new code")

  //   if (code !== otp.code) throw createHttpError(403, "Invalid code, try again")

  //   return res.status(200).json("Verified")
  // },

  // async changePassword(req: Request<{}, {}, ChangePassword>, res) {
  //   const { password } = req.body

  //   const { id } = req.user

  //   const hashedPW = await hash(password, 10)

  //   await prisma.user.update({ where: { id }, data: { password: hashedPW } })

  //   return res.status(200).json("Password changed")
  // },

  // async updateAccount(req: Request<{}, {}, UserSchema>, res) {
  //   const { id } = req.user

  //   let data = req.body

  //   await prisma.user.update({ where: { id }, data })

  //   return res.status(200).json("Account details updated")
  // },
})
