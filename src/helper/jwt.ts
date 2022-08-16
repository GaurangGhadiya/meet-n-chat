import jwt from 'jsonwebtoken'
import config from 'config'
import { userModel } from '../database'
import mongoose from 'mongoose'
import {  apiResponse, userStatus } from '../common'
import { Request, response, Response } from 'express'
import { responseMessage } from './response'

const ObjectId = mongoose.Types.ObjectId
const jwt_token_secret = config.get('jwt_token_secret')

export const userJWT = async (req: Request, res: Response, next) => {
    let { authorization, userType } = req.headers,
        result: any
    if (authorization) {
        try {
            let isVerifyToken = jwt.verify(authorization, jwt_token_secret)
            if (isVerifyToken?.type != userType && userType != "5") return res.status(403).json(await apiResponse(403, responseMessage?.accessDenied, {}, {}));
            if (process?.env?.NODE_ENV == 'production') {
                // 1 day expiration
                if (parseInt(isVerifyToken.generatedOn + 86400000) < new Date().getTime()) {
                    // if (parseInt(isVerifyToken.generatedOn + 120000) < new Date().getTime()) {
                    return res.status(410).json(await apiResponse(410, responseMessage?.tokenExpire, {}, {}))
                }
            }

            // result = await userModel.findOne({ _id: ObjectId(isVerifyToken._id), isActive: true })
            if (result?.isUserActive == false) return res.status(403).json(await apiResponse(403, responseMessage?.accountBlock, {}, {}));
            if (result?.isActive == true && isVerifyToken.authToken == result.authToken) {
                // Set in Header Decode Token Information
                req.headers.user = result
                return next()
            } else {
                return res.status(401).json(await apiResponse(401, responseMessage?.invalidToken, {}, {}))
            }
        } catch (err) {
            if (err.message == "invalid signature") return res.status(403).json(await apiResponse(403, responseMessage?.differentToken, {}, {}))
            console.log(err)
            return res.status(401).json(await apiResponse(401, responseMessage.invalidToken, {}, {}))
        }
    } else {
        return res.status(401).json(await apiResponse(401, responseMessage?.tokenNotFound, {}, {}))
    }
}
