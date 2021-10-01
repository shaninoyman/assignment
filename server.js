require('dotenv').config()

let express = require('express')
let app = express()
let mongoose = require('mongoose')

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true })
let db = mongoose.connection
db.on('error', (error) => console.error(error))
db.on('open', () => console.log('Connected to Database'))

app.use(express.json())

let subscribersRouter = require('./routes/subscribers')
console.log(typeof subscribersRouter.validateSubscriber)
app.use('/subscribers', subscribersRouter.router)

let tweetsRouter = require('./routes/tweets')
app.use('/tweets', tweetsRouter)

app.listen(3000, () => console.log('Server started'))


