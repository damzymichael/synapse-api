import { Request } from "express"
import { Controller } from "../lib/requestHandler.config"
// import createHttpError from "http-errors"
import prisma from "../lib/db.connection"
import { User, Skill } from "@prisma/client"

type ProfileUpdateSchema = Pick<User, "email" | "fullName" | "aboutMe" | "bio">

type AddSKillSchema = Pick<Skill, "name" | "level">

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

  async getSkills(req, res) {
    const skills = await prisma.skill.findMany({
      where: { userId: req.user.id },
      select: { name: true, level: true },
    })

    return res.status(200).send(skills)
  },

  async addSkill(req: Request<{}, {}, AddSKillSchema>, res) {
    const { name, level } = req.body

    await prisma.skill.create({ data: { userId: req.user.id, name, level } })

    return res.status(201).send("Skill added successfully")
  },

  async deleteSkill(req: Request<{ id: string }>, res) {
    const skillId = req.params.id

    await prisma.skill.delete({ where: { id: skillId } })

    return res.status(200).send("Skill removed successfully")
  },
})
