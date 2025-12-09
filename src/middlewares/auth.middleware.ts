import createHttpError from "http-errors"
import prisma from "../lib/db.connection"
import { asyncWrapper, Controller } from "../lib/requestHandler.config"
import jwt from "jsonwebtoken"
import env from "../lib/env"

const logout = asyncWrapper(async (req, res, next) => {
  req.logout = async () => {
    res.clearCookie("session.token", {
      signed: true,
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "none",
      secure: true,
    })
    return true
  }
  next()
})

const authenticate = Controller({
  async user(req, res, next) {
    const token = req.signedCookies["session.token"]

    console.log(token)

    if (!token) throw createHttpError(401, "Unauthorized - No token provided")

    const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string }

    if (!decoded) throw createHttpError(401, "Session expired")

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { email: true, fullName: true },
    })

    if (!user) throw createHttpError(404, "User not found")

    req.user = user

    next()
  },
})

export { authenticate, logout }
