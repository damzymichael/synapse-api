import { Router } from "express"
import controller from "../controllers/auth.controller"
import { logout } from "../middlewares/auth.middleware"

const router = Router()

router.use(logout)

router.post("/register", controller.register)

router.post("/login", controller.login)

router.post("/logout", controller.logout)

export default router
