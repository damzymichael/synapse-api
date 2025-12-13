import { Request } from "express"
import { Controller } from "../lib/requestHandler.config"
import prisma from "../lib/db.connection"
import nodemailer from "nodemailer"
import path from "path"
import fs from "fs"
import env from "../lib/env"

const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: env.EMAIL_USERNAME,
    pass: env.EMAIL_PASSWORD,
  },
})

type TradeRequest = { skillId: string; learnId: string; receiverId: string }

const templatePath =
  env.NODE_ENV == "production"
    ? path.join(__dirname, "templates", "request.html")
    : path.join(__dirname, "..", "templates", "request.html")

let html = fs.readFileSync(templatePath, "utf-8")

export default Controller({
  async getSuggestions(req, res) {
    const userId = req.user.id

    const { skills, learnings } = await prisma.user.findUnique({
      where: { id: userId },
      select: { skills: { select: { name: true } }, learnings: { select: { name: true } } },
    })

    if (skills.length < 1 || learnings.length < 1) {
      res.status(200).send([])
    }

    // Return users teaching what the current user in this session wants to learn
    const teachers = await prisma.skill.findMany({
      where: { name: { in: learnings.map((x) => x.name) } },
      select: {
        id: true,
        name: true,
        credit: true,
        user: { select: { id: true, fullName: true } },
      },
    })

    // Return users that wants to learn what the user in the current session is teaching
    const learners = await prisma.learning.findMany({
      where: { name: { in: skills.map((x) => x.name) } },
      select: { id: true, name: true, user: { select: { id: true, fullName: true } } },
    })

    const learnersMap = new Map<string, (typeof learners)[number]>()

    for (const learner of learners) {
      if (!learnersMap.has(learner.user.id)) {
        learnersMap.set(learner.user.id, learner)
      }
    }

    type Teacher = (typeof teachers)[number] & { learning: string; learningId: string }

    const commonUsers: Teacher[] = []

    teachers.forEach((teach) => {
      if (learnersMap.has(teach.user.id)) {
        const learner = learnersMap.get(teach.user.id)
        commonUsers.push({ ...teach, learning: learner.name, learningId: learner.id })
      }
    })

    res.status(200).send(commonUsers)
  },

  async requestTrade(req: Request<{}, {}, TradeRequest>, res) {
    const senderId = req.user.id

    const { skillId, learnId, receiverId } = req.body

    const tradeRequest = await prisma.tradeRequest.create({
      data: { senderId, receiverId, skillId, learnId },
      select: {
        skill: { select: { name: true } },
        learning: { select: { name: true } },
        receiver: { select: { fullName: true, email: true } },
      },
    })

    html = html
      .replace("{{senderName}}", req.user.fullName)
      .replace(/{{receiverSkills}}/g, tradeRequest.skill.name)
      .replace(/{{senderSkills}}/g, tradeRequest.learning.name)

    // Mail the receiver of the request
    await transporter.sendMail({
      from: '"Synapse" <noreply@synapse.damzymike.com>',
      to: tradeRequest.receiver.email,
      subject: "New Trade Request",
      replyTo: "noreply@synapse.damzymike.com",
      html,
    })

    return res.status(201).send("Trade requested")
  },

  async getRequests(req, res) {
    const userId = req.user.id

    const requests = await prisma.tradeRequest.findMany({
      where: { receiverId: userId, status: "PENDING" },
      select: {
        sender: { select: { fullName: true } },
        learning: { select: { name: true } },
        skill: { select: { name: true, credit: true } },
      },
    })

    return res.status(200).send(requests)
  },
})
