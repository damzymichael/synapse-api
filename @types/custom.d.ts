import "express"
import { User } from "@prisma/client"

declare module "express" {
  interface Request {
    user?: { id: string; email: string; fullName: string }
    logout: () => Promise<Boolean | void>
  }
}
