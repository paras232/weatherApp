const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')
const {User}=require('../models/user.model')
const {redis}=require('../config/redis')
const {winstonLogger}=require('../middleware/winston')

module.exports={
    login: async(req,res)=>{
        try {
            const {email, password } = req.body;
            const isUserPres= await User.findOne({email});

            if(!isUserPres) return res.status(400).send({message: 'Not a user, please login'})

            const ispasscorr=bcrypt.compareSync(
                password,
                isUserPres.password
            );

            if(!ispasscorr) return res.status(400).send({message: 'Wrong credential'})

            const accessToken=jwt.sign(
                {userId: isUserPres._id},
                process.env.JWT_ACCESS_TOKEN_KEY,
                {expiresIn:process.env.JWT_ACCESS_TOKEN_EXP}
            )

            const refreshToken=jwt.sign(
                {userId: isUserPres._id},
                process.env.JWT_REFRESH_TOKEN_KEY,
                {expiresIn: process.env.JWT_REFRESH_TOKEN_EXP}
            )

            await redis.set(
                isUserPres._id + '_access_token',
                accessToken,
                'EX',
                60
            )
            await redis.set(
                isUserPres._id + '_refresh_token',
                refreshToken,
                'EX',
                60*3
            )

            res.cookie('access_token_key', isUserPres._id + '_access_token')
            res.cookie('refresh_token_key', isUserPres._id + '_refresh_token')
            res.status(200).send({msg:'login successfull'})
        } catch (error) {
            winstonLogger.error(error.message)
            res.status(500).send({msg:error.message})
        }
    },

    signup: async(req,res)=>{
        try {
            const {email, password}=req.body;
            const isUserPres=await User.findOne({email});

            if(isUserPres){
                return res.status(400).send({msg:'email already exitis please add new email'})
            }

            const hashedPassword=bcrypt.hashSync(password, 8);
            const newUser = new User({...req.body,password:hashedPassword});
            await newUser.save();
            res.send({msg:"signup successfull", user : newUser})
        } catch (error) {
            winstonLogger.error(error.message)
            res.status(500).send({msg:error.message})
        }
    },

    logout: async(req,res)=>{
        try {
            const tokenKey=req?.cookies?.access_token_key
            const refreshKey=req?.cookies?.refresh_token_key

            const accessToken = await redis.get(tokenKey)
            const refreshToken = await redis.get(refreshKey)

            await redis.set(accessToken,accessToken, "EX", 60*10)
            await redis.set(refreshToken, refreshToken, 'EX', 60*10)
            await redis.del(tokenKey)
            await redis.del(refreshKey)
            res.send({msg:"logout successfull"})
        } catch (error) {
            winstonLogger.error(error.message)
            res.status(500).send({msg:error.message})
        }
    },
    refreshTokens: async(req,res)=>{
        try {
            const tokenKey=req?.cookies?.refresh_token_key
            const refreshToken = await redis.get(tokenKey)

            if(!refreshToken) return res.status(400).send({msg:"unauthorize"})

            const isTokenValid= await jwt.verify(
                refreshToken,
                process.env.JWT_REFRESH_TOKEN_KEY
            )
            if(!isTokenValid) return res.status(400).send({msg:"unauthorize"})
            const accessToken = jwt.sign(
                {userId: isTokenValid.userId},
                process.env.JWT_ACCESS_TOKEN_KEY,
                {expiresIn: process.env.JWT_ACCESS_TOKEN_EXP}
            )
            await redis.set(
                isTokenValid.userId + '_access_token',
                accessToken,
                'EX',
                60
            )
            res.cookie('access_token_key', isTokenValid.userId + '_access_token')
            res.send({msg:"Token genrated"})
        } catch (error) {
            winstonLogger.error(error.message)
            res.status(500).send({msg:error.message})
        }
    }

}