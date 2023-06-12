const {redis}=require('../config/redis')
const jwt=require('jsonwebtoken')
const {winstonLogger}=require('./winston')

module.exports = {
    auth: async (req,res,next)=>{
        try {
            const tokenKey=req?.cookies?.access_token_key
            const accessToken = await redis.get(tokenKey)
            const isTokenValid= await jwt.verify(
                accessToken,
                process.env.JWT_ACCESS_TOKEN_KEY
            );

            if(!isTokenValid) return res.status(404).send({message:'Jwt expired.'})

            req.payload=isTokenValid;
            next()

        } catch (error) {
            winstonLogger.error(error.message)
            res
              .status(500)
              .send({message:"Authentication error",error:error.message})
        }
    }
}