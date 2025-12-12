import { Router } from "express"
import { authenticate } from "../middlewares/auth.middleware"
import tradeController from "../controllers/trade.controller"

const router = Router()

router.use(authenticate.user)

router.get("/suggestion", tradeController.getSuggestions)

router.get("/matches")

export default router
