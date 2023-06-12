const {getweather}=require('../controllers/weather.controller')
const {validate}=require('../middleware/validate')

const wRouter=require('express').Router()

wRouter.get('/getweather', validate, getweather)

module.exports={wRouter}