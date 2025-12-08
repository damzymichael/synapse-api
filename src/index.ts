import app from "./app.config"
import env from "./lib/env"

const PORT = env.PORT

app.listen(PORT, () => console.log("Listening on PORT " + PORT))
