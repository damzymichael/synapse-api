import { cleanEnv, port, str } from "envalid"

export default cleanEnv(process.env, {
  PORT: port(),
  JWT_SECRET: str(),
  DATABASE_URL: str(),
  COOKIE_SECRET: str(),
  CLIENT_URL: str(),
  NODE_ENV: str({ choices: ["development", "production"] }),
})
