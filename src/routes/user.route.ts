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

router.get("/learn", controller.getLearn)

router.post("/learn", controller.addLearn)

router.delete("/learn/:id", controller.deleteLearn)

export default router
