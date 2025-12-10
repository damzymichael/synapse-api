import { Router } from "express"
import controller from "../controllers/user.controller"
import { authenticate } from "../middlewares/auth.middleware"

const router = Router()

router.get("/profile", authenticate.user, controller.getProfile)

router.patch("/profile", authenticate.user, controller.updateProfile)

export default router
