const express = require('express')
const app = express()
const mongoose = require('mongoose')
const PORT = 5000
const {MONGOURI} = require('./keys')

mongoose.connect(MONGOURI,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})
mongoose.connection.on('connected', () =>{
    console.log('Connected to MongoDB')
})
mongoose.connection.on('error', (err) =>{
    console.error('error connecting to mongodb')
})

require('./models/user')
require('./models/post')

app.use(express.json())
app.use(require('./routes/auth'))
app.use(require('./routes/post'))
app.use(require('./routes/user'))

app.listen(PORT,() => {
    console.log(`SERVER Running on ${PORT}`)
})

