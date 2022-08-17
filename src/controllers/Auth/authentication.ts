"use strict"
import { reqInfo } from '../../helpers/winston_logger'
import { userModel, userSessionModel } from '../../database/models'
import { apiResponse } from '../../common'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import config from 'config'
import { Request, Response } from 'express'
// import { deleteImage } from '../../helpers/s3'
// import async from 'async'
import { email_verification_mail, forgot_password_mail } from "../../helpers/mail";
import { responseMessage } from '../../helpers/response'
// import { isDate } from 'moment'
// import { commonModel } from '../../database/models/common'

const ObjectId = require('mongoose').Types.ObjectId
const jwt_token_secret = config.get('jwt_token_secret')
const refresh_jwt_token_secret = config.get('refresh_jwt_token_secret')


export const signUp = async (req: Request, res: Response) => {
    reqInfo(req)

    try {
        let body = req.body, otpFlag = 1, authToken = 0
        let isAlready: any = await userModel.findOne({ email: body?.email, isActive: true })
        if (isAlready) return res.status(409).json(new apiResponse(409, responseMessage?.alreadyEmail, {}, {}))
        if (isAlready?.isEmailVerified == false) return res.status(502).json(new apiResponse(502, responseMessage.emailUnverified, {}, {}));
        while (otpFlag == 1) {
            for (let flag = 0; flag < 1;) {
                authToken = await Math.round(Math.random() * 10000)
                if (authToken.toString().length == 4) {
                    flag++
                }
            }
            let isAlreadyAssign = await userModel.findOne({ otp: authToken })
            if (isAlreadyAssign?.otp != authToken) otpFlag = 0
        }
        body.authToken = authToken
        body.otp = authToken
        // body.otpExpireTime = new Date(new Date().setMinutes(new Date().getMinutes() + 10))
        const salt = await bcryptjs.genSaltSync(8)
        const hashPassword = await bcryptjs.hash(body.password, salt)
        delete body.password
        body.password = hashPassword
        await new userModel(body).save().then(async (data) => {
            await email_verification_mail(data, authToken)
            return res.status(200).json(new apiResponse(200, responseMessage?.signupSuccess, { _id: data._id }, {}))
        })
    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const login = async (req: Request, res: Response) => {
    let body = req.body,
        response: any
    reqInfo(req)
    try {
        // response = await userModel.findOneAndUpdate({ email: body.email, isActive: true }, { $addToSet: { deviceToken: body?.deviceToken } }).select('-__v -createdAt -updatedAt')
        // response = await userModel.findOne({ email: body.email, isActive: true }).select('-__v -createdAt -updatedAt')
        response = await userModel.findOneAndUpdate({ email: body.email, isActive: true }, { lastLogin: new Date() }, { new: true }).select('-__v -createdAt -updatedAt')
        if (!response) return res.status(400).json(new apiResponse(400, responseMessage?.invalidUserPasswordEmail, {}, {}))
        if (response.isEmailVerified == false) return res.status(502).json(new apiResponse(502, responseMessage?.emailUnverified, {}, {}));
        const passwordMatch = await bcryptjs.compare(body.password, response.password)
        if (!passwordMatch) return res.status(400).json(new apiResponse(400, responseMessage?.invalidUserPasswordEmail, {}, {}))
        const token = jwt.sign({
            _id: response._id,
            authToken: response.authToken,
            type: response.userType,
            status: "Login",
            generatedOn: (new Date().getTime())
        }, jwt_token_secret)
        const refresh_token = jwt.sign({
            _id: response._id,
            generatedOn: (new Date().getTime())
        }, refresh_jwt_token_secret)
        await new userSessionModel({
            createdBy: response._id,
            refresh_token
        }).save()
        response = {
            userType: response?.userType,
            loginType: response?.loginType,
            _id: response?._id,
            name: response?.name,
            email: response?.email,
            image: response?.image,
            phoneNumber: response?.phoneNumber,
            isEmailVerified: response?.isEmailVerified,
            token,
            refresh_token
        }
        return res.status(200).json(new apiResponse(200, responseMessage?.loginSuccess, response, {}))

    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const forgot_password = async (req: Request, res: Response) => {
    reqInfo(req);
    let body = req.body,
        otpFlag = 1, // OTP has already assign or not for cross-verification
        otp = 0
    try {
        body.isActive = true;
        let data = await userModel.findOne(body);

        if (!data) {
            return res.status(400).json(new apiResponse(400, responseMessage?.invalidEmail, {}, {}));
        }
        
        if (data?.isEmailVerified == false) return res.status(502).json(new apiResponse(502, responseMessage?.emailUnverified, {}, {}));
        while (otpFlag == 1) {
            for (let flag = 0; flag < 1;) {
                otp = await Math.round(Math.random() * 10000);
                if (otp.toString().length == 4) {
                    flag++;
                }
            }
            let isAlreadyAssign = await userModel.findOne({ otp: otp });
            if (isAlreadyAssign?.otp != otp) otpFlag = 0;
        }
        let response: any = await forgot_password_mail(data, otp).then(result => { return result }).catch(error => { return error })
        if (response) {
            await userModel.findOneAndUpdate(body, { otp })
            return res.status(200).json(new apiResponse(200, `${response}`, {}, {}));
        }
        else return res.status(501).json(new apiResponse(501, responseMessage?.errorMail, {}, `${response}`));
    } catch (error) {
        return res
            .status(500)
            .json(new apiResponse(500, responseMessage?.internalServerError, {}, error));
    }
};

export const reset_password = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        authToken = 0,
        id = body.id
        // otp = body?.otp
    // delete body.otp
    try {
        const salt = await bcryptjs.genSaltSync(10)
        const hashPassword = await bcryptjs.hash(body.password, salt)
        delete body.password
        delete body.id
        body.password = hashPassword

        for (let flag = 0; flag < 1;) {
            authToken = await Math.round(Math.random() * 10000)
            if (authToken.toString().length == 4) {
                flag++
            }
        }
        body.authToken = authToken
        // body.otp = 0
        
        let response = await userModel.findOneAndUpdate({ _id: ObjectId(id), isActive: true }, body,{new: true})
        console.log("response",response);
        
        if (response) {
            return res.status(200).json(new apiResponse(200, responseMessage?.resetPasswordSuccess, { action: "please go to login page" }, {}))
        }
        else return res.status(501).json(new apiResponse(501, responseMessage?.resetPasswordError, response, {}))

    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const otp_verification = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body
    try {
        body.isActive = true
        let data = await userModel.findOneAndUpdate(body, { otp: null, isEmailVerified: true, authToken: body.otp, lastLogin: new Date() }, { new: true });
        console.log("data veri",data);
        
        if (!data) return res.status(400).json(new apiResponse(400, responseMessage?.invalidOTP, {}, {}))
        const token = jwt.sign({
            _id: data._id,
            authToken: data.authToken,
            type: data.userType,
            status: "Login",
            generatedOn: (new Date().getTime())
        }, jwt_token_secret)
        const refresh_token = jwt.sign({
            _id: data._id,
            generatedOn: (new Date().getTime())
        }, refresh_jwt_token_secret)
        await new userSessionModel({
            createdBy: data._id,
            refresh_token
        }).save()
        if (data) return res.status(200).json(new apiResponse(200, responseMessage?.OTPverified, {
            userType: data?.userType,
            loginType: data?.loginType,
            _id: data?._id,
            name: data?.name,
            email: data?.email,
            image: data?.image,
            otp: data?.otp,
            phoneNumber: data?.phoneNumber,
            isEmailVerified: data?.isEmailVerified,
            token,
            refresh_token
        }, {}));
    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const resend_otp = async (req: Request, res: Response) => {
    reqInfo(req)
    let { email } = req.body,
        otpFlag = 1, // OTP has already assign or not for cross-verification
        otp = 0,
        response
    try {
        let data = await userModel.findOne({ email, isActive: true })
        if (!data) return res.status(400).json(new apiResponse(400, responseMessage.invalidEmail, {}, {}));
        while (otpFlag == 1) {
            for (let flag = 0; flag < 1;) {
                otp = await Math.round(Math.random() * 10000)
                if (otp.toString().length == 4) {
                    flag++
                }
            }
            let isAlreadyAssign = await userModel.findOne({ otp: otp })
            if (isAlreadyAssign?.otp != otp) otpFlag = 0
        }
        if (data.isEmailVerified == false) {
            response = await email_verification_mail(data, otp)
        }
        else {
            response = await forgot_password_mail(data, otp)
        }
        if (response) {
            await userModel.findOneAndUpdate({ email, isActive: true }, { otp })
            return res.status(200).json(new apiResponse(200, `${response}`, {}, {}));
        }
        else return res.status(501).json(new apiResponse(501, responseMessage.errorMail, {}, `${response}`));
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, {}))
    }
}