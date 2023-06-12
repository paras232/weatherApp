const axios=require('axios')
const {redis}=require('../config/redis')
const {winstonLogger}=require('../middleware/winston')


module.exports={
    getweather: async(req,res)=>{
        try{
            const {city}=req.query
            const existedData=await redis.get(`${city}`)
            if(existedData) return res.send({data:JSON.parse(existedData)})

            const {data}= awaitaxios.get(`https://api.openweathermap.org/data/2.5/weather${city}/json`)
            await redis.set(`${city}`,JSON.stringify(data),"EX",60*60*6)
            res.send({data})
        }catch(error){
            winstonLogger.error(error.message)
            res.status(500).send({msg:error.message})
        }
    }
}