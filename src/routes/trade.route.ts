import { Router } from "express"
import { authenticate } from "../middlewares/auth.middleware"
import tradeController from "../controllers/trade.controller"

const router = Router()

router.use(authenticate.user)

router.post("/request", tradeController.requestTrade)

router.get("/suggestion", tradeController.getSuggestions)

router.get("/requests", tradeController.getRequests)

export default router
