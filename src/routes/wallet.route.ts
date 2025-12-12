import { Router } from "express"
import walletController from "../controllers/wallet.controller"
import { authenticate } from "../middlewares/auth.middleware"

const router = Router()

global.sendSseToUser = (userId: string, amount: number) => {
  if (global.sseClients && global.sseClients[userId]) {
    global.sseClients[userId].write(`data: Balance updated with ${amount}\n\n`)
  }
}

router.get("/details", authenticate.user, walletController.getWalletInfo)

router.post("/fund", authenticate.user, walletController.fundWallet)

router.get("/updates", authenticate.user, walletController.handleConnection)

router.post("/webhook", walletController.webhookHandler)

export default router
