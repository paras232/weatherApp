const express=require('express')
const {connection}=require('./config/db')
require('dotenv').config()
const {userRouter}=require('./routes/user.routes')
const {wRouter}=require('./routes/weather')
const {auth}=require('./middleware/auth')

const cookieParser=require('cookie-parser')

const app=express()
const Port= process.env.port || 8000

app.use(express.json())
app.use(cookieParser())

app.get('/', async(req,res)=>{
    res.send("Home Page")
})

app.use('/user',userRouter)
app.use(auth)
app.use('/city',wRouter)

app.listen(Port,async()=>{
    try {
        await connection
        console.log(`Server running on port :${Port}`)
    } catch (err) {
        console.log(err.message)  
    }
})