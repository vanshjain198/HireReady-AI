const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")

const app = express()

const allowedOrigins = (process.env.CLIENT_URLS || "http://localhost:5173,https://gen-ai-project-with-mern.vercel.app")
  .split(",")
  .map(origin => origin.trim())
  .filter(Boolean)

app.use(express.json())
app.use(cookieParser())
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true)
    }

    return callback(new Error("Not allowed by CORS"))
  },
  credentials: true
}))

const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")

app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)

module.exports = app
