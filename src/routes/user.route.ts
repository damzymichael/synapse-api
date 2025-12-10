import { Router } from "express"
import controller from "../controllers/user.controller"
import { authenticate } from "../middlewares/auth.middleware"

const router = Router()

router.use(authenticate.user)

router.get("/profile", controller.getProfile)

router.patch("/profile", controller.updateProfile)

router.get("/skills", controller.getSkills)

router.post("/skills", controller.addSkill)

router.delete("/skills/:id", controller.deleteSkill)

export default router
