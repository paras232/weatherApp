const {
    signup,
    login,
    logout,
    refreshToken,
}=require('../controllers/user.controller');

const userRouter = require('express').Router();

userRouter.post('/register',signup)
userRouter.post('/login',login)
userRouter.get('/logout',logout)
userRouter.get('/refresh-token',refreshToken)

module.exports={userRouter}