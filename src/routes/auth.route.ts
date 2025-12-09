import { Router } from "express"
import controller from "../controllers/auth.controller"
import { authenticate, logout } from "../middlewares/auth.middleware"

const router = Router()

router.use(logout)

router.post("/register", controller.register)

router.post("/login", controller.login)

router.post("/logout", controller.logout)

//@ts-ignore
router.get("/check", authenticate.user, (req, res) => res.status(200).json(req.user))

export default router
