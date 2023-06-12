module.exports={
    Validate: async(req,res,next)=>{
        const {city}=req.query
        const regex= /^[a-zA-Z]+$/
        if(regex.test(city)){
            next();
        }else{
            res.status(400).send({message: 'invalid query'})
        }
    },

};