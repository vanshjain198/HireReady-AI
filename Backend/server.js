require("dotenv").config({ path: require("path").join(__dirname, ".env"), override: true })
const app = require("./src/app")
const connectToDB = require("./src/config/database")

connectToDB()


const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})