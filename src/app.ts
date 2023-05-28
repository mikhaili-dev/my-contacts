import express from "express"
import config from 'config'
import mongoose from "mongoose"
import { authRoute } from "./routes/auth.route.js"
import { contactRoute } from "./routes/contact.route.js"

const app: express.Express = express()
const PORT: number = config.get('PORT')

app.use(express.json())
app.use('/api/auth', authRoute)
app.use ('/api/contact', contactRoute)

mongoose.set('strictQuery', false)

async function startServer() {
    try {
        await mongoose.connect(config.get('MONGO_URI'))

        app.listen(PORT, () => console.log(`The server has been started on a port ${PORT}...`))
    } catch (error: unknown) {
        console.log(error)
    }
}
startServer()