import { Request } from "express"
import { Controller } from "../lib/requestHandler.config"
// import createHttpError from "http-errors"
import prisma from "../lib/db.connection"
import Stripe from "stripe"
import env from "../lib/env"

type FundWallet = { amount: number }

const stripe = new Stripe(env.STRIPE_SECRET_KEY)

export default Controller({
  async getWalletInfo(req, res) {
    const { credit } = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { credit: true },
    })

    res.status(200).send({ credit })
  },

  async fundWallet(req: Request<{}, {}, FundWallet>, res) {
    const { amount } = req.body
    const amountInSmallestUnit = Math.round(amount * 100)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInSmallestUnit,
      currency: "ngn",
      metadata: { userId: req.user.id },
      payment_method_types: ["card"],
      receipt_email: req.user.email,
    })
    return res.status(201).send({ clientSecret: paymentIntent.client_secret })
  },

  async webhookHandler(req, res) {
    // console.log(req.body.data.object)
    if (req.body.type === "payment_intent.succeeded") {
      const userId: string = req.body.data.object.metadata.userId
      await prisma.user.update({
        where: { id: userId },
        data: { credit: { increment: req.body.data.object.amount / 100 } },
      })
    }
    return res.json({ received: true })
  },
})
