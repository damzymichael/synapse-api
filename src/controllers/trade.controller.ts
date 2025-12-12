import { Request } from "express"
import { Controller } from "../lib/requestHandler.config"
import prisma from "../lib/db.connection"

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

    type Teacher = (typeof teachers)[number] & { learning: string }

    const commonUsers: Teacher[] = []

    teachers.forEach((teach) => {
      if (learnersMap.has(teach.user.id)) {
        const learner = learnersMap.get(teach.user.id)
        commonUsers.push({ ...teach, learning: learner.name })
      }
    })

    res.status(200).send(commonUsers)
  },

  async getMatches() {},
})
