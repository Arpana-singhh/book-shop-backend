import express from 'express'
import { getUserData, isAuthenticated, login, logout, register, resetPassword, sentResetOtp, updateAddress, verifyEmail, verifyOtp } from '../controller/authController.js';
import  {authenticateToken} from '../middleware/userAuth.js'
const authRouter =express.Router();

authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.get('/get-user',authenticateToken, getUserData)
authRouter.post('/verify-email',verifyEmail)
authRouter.get('/is-auth',authenticateToken, isAuthenticated)
authRouter.post('/send-reset-otp', sentResetOtp)
authRouter.post('/verify-reset-otp', verifyOtp)
authRouter.post('/reset-password', resetPassword)
authRouter.post('/logout', logout)
authRouter.put('/update-address',authenticateToken, updateAddress)




export default authRouter

