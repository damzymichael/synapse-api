import { Router } from "express"
import walletController from "../controllers/wallet.controller"
import { authenticate } from "../middlewares/auth.middleware"

const router = Router()

router.get("/details", authenticate.user, walletController.getWalletInfo)

router.post("/fund", authenticate.user, walletController.fundWallet)

router.post("/webhook", walletController.webhookHandler)

export default router
