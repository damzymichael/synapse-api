import { Request } from "express"
import { Controller } from "../lib/requestHandler.config"
// import createHttpError from "http-errors"
import prisma from "../lib/db.connection"
import { User } from "@prisma/client"

type ProfileUpdateSchema = Pick<User, "email" | "fullName" | "aboutMe" | "bio">

export default Controller({
  async getProfile(req, res) {
    const id = req.user.id
    const user = await prisma.user.findUnique({
      where: { id },
      select: { fullName: true, email: true, bio: true, aboutMe: true },
    })
    return res.status(200).send(user)
  },

  async updateProfile(req: Request<{}, {}, ProfileUpdateSchema>, res) {
    const { fullName, email, aboutMe, bio } = req.body

    await prisma.user.update({
      where: { id: req.user.id },
      data: { email, fullName, aboutMe, bio },
    })

    return res.status(200).send("Profile update successful")
  },
})
