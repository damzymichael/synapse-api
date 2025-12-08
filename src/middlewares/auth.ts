import createHttpError from "http-errors"
import prisma from "../util/db.connection"
import { asyncWrapper, Controller } from "../util/requestHandler.config"
import { Request } from "express"
import jwt from "jsonwebtoken"
import env from "../util/env"

const logout = asyncWrapper(async (req, res, next) => {
  req.logout = async () => {
    res.clearCookie("session.token", {
      signed: true,
      sameSite: "none",
      secure: true,
    })
    return true
  }
  next()
})

type ID = { userId: string }

type MiddlewareRequest = Request<ID, {}, ID>

/**Checks request body or params and verifies user */
const verifyUser = asyncWrapper(async (req: MiddlewareRequest, res, next) => {
  const userId = req.body.userId || req.params.userId

  if (!userId) throw createHttpError(403, "Invalid ID")

  const user = await prisma.user.findUnique({ where: { id: userId } })

  if (!user) throw createHttpError(404, "User not found")

  req.user = user

  next()
})

/**Authenticates user or admin through headers in request or cookie for admin */
const authenticate = Controller({
  async user(req, res, next) {
    const token = req.cookies.jwt
    if (!token) throw createHttpError(401, "Unauthorized - No token provided")

    const decoded = jwt.verify(token, env.JWT_SECRET)

    if (!decoded) throw createHttpError(401, "Session expired")

    const user = await prisma.user.findUnique({ where: { id: decoded as string } })

    if (!user) throw createHttpError(404, "User not found")

    req.user = user

    next()
  },
})

export { verifyUser, authenticate, logout }
