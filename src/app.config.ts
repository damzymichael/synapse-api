import "dotenv/config"
import express, { Request, Response, NextFunction } from "express"
import morgan from "morgan"
import cors from "cors"
import helmet from "helmet"
import cookieParser from "cookie-parser"
import createHttpError, { isHttpError } from "http-errors"
import authRoutes from "./routes/auth.route"
import env from "./lib/env"

const homeMessage = `
<div style="display: flex; align-items: center; justify-content: center; height: 90vh"> 
<h1 style="font-size: 72px; background: -webkit-linear-gradient(45deg, #09009f, #00ff95 80%); -webkit-background-clip: text;
-webkit-text-fill-color: transparent;">SYNAPSE REST API</h1>
</div>
`

const app = express()

app.use(helmet())

app.use(morgan("dev"))

app.use(cors({ origin: [env.CLIENT_URL, "http://localhost:5173"], credentials: true }))

app.use(cookieParser(env.COOKIE_SECRET))

app.use(express.json())

app.use(express.urlencoded({ extended: true }))

app.get("/", (req, res) => res.status(200).send(homeMessage))

app.use("/auth", authRoutes)

//Not found
app.use((_, __, next) => next(createHttpError(404, "Endpoint not found")))

//Error Middleware
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
  console.error(error)
  let errorMessage = "An unknown error occurred"
  let statusCode = 500
  //Todo Handle prisma invalid id error
  if (isHttpError(error)) {
    statusCode = error.status
    errorMessage = error.message
  }
  res.status(statusCode).json({ message: errorMessage })
})

export default app
