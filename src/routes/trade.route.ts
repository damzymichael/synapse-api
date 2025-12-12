import { Router } from "express"
import { authenticate } from "../middlewares/auth.middleware"

const router = Router()

router.use(authenticate.user)

router.get("/suggestion")

router.get("/matches")

export default router
