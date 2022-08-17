import express from 'express'
import { authenticationController, userController } from '../controllers'
import { userJWT } from '../helpers/jwt'
import {  userValidation } from '../validation'
const router = express.Router()


router.post('/signup', userValidation.signUp, authenticationController.signUp)
router.post('/login', userValidation.login, authenticationController.login)
router.post('/otp_verification', userValidation.otp_verification, authenticationController.otp_verification)
router.post('/forgot_password', userValidation.forgot_password, authenticationController.forgot_password)
router.post('/reset_password', userValidation.reset_password, authenticationController.reset_password)
router.post('/resend_otp', userValidation?.resend_otp, authenticationController.resend_otp)

// router.use(userJWT)
router.post('/get_user', userController.get_user)



export const userRouter = router