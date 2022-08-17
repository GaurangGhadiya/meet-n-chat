import jwt from 'jsonwebtoken'
import config from 'config'
import { userModel } from '../database/models'
import mongoose from 'mongoose'
import { apiResponse, } from '../common'
import { Request, Response } from 'express'
import { responseMessage } from './response'

const ObjectId = mongoose.Types.ObjectId
const jwt_token_secret = config.get('jwt_token_secret')

export const userJWT = async (req: Request, res: Response, next) => {
    let { authorization, userType } = req.headers,
        result: any
    if (authorization) {
        try {
            let isVerifyToken = jwt.verify(authorization, jwt_token_secret)
            result = await userModel.findOne({ _id:new  ObjectId(isVerifyToken._id), isActive: true })
            if (isVerifyToken?.type != userType && userType != "5") return res.status(403).json(new apiResponse(403, responseMessage.accessDenied, {}, {}));
            if (result?.isBlock == true) return res.status(403).json(new apiResponse(403, 'Your account han been blocked.', {}, {}));
            if (result?.isActive == true && isVerifyToken.authToken == result.authToken && isVerifyToken.type == result.userType) {
                // Set in Header Decode Token Information
                req.headers.user = result
                return next()
            } else {
                return res.status(401).json(new apiResponse(401, "Invalid-Token", {}, {}))
            }
        } catch (err) {
            if (err.message == "invalid signature") return res.status(403).json(new apiResponse(403, `Don't try different one token`, {}, {}))
            console.log(err)
            return res.status(401).json(new apiResponse(401, "Invalid Token", {}, {}))
        }
    } else {
        return res.status(401).json(new apiResponse(401, "Token not found in header", {}, {}))
    }
}

export const partial_userJWT = async (req: Request, res: Response, next) => {
    let { authorization } = req.headers

    if (!authorization) {
        next()
    } else {
        try {
            let isVerifyToken = jwt.verify(authorization, jwt_token_secret)
            let _id = isVerifyToken._id
            // if (parseInt(isVerifyToken.generatedOn + 3600000) < new Date().getTime()) {
            //     return res.status(410).json(new apiResponse(410, "Token has been expired.", {}, {}))
            // }
            const result = await userModel.findOne({ _id:new ObjectId(_id), isActive: true })
            if (result?.isBlock == true) return res.status(403).json(new apiResponse(403, 'Your account han been blocked.', {}, {}));
            if (result.isActive == true && isVerifyToken.authToken == result.authToken && isVerifyToken.type == result.userType) {
                // Set in Header Decode Token Information
                req.headers.user = isVerifyToken
                return next()
            } else {
                return res.status(401).json(new apiResponse(401, "Invalid-Token", {}, {}))
            }
        } catch (err) {
            if (err.message == "invalid signature") return res.status(403).json(new apiResponse(403, `Don't try different one token`, {}, {}))
            if (err.message === "jwt must be provided") return res.status(403).json(new apiResponse(403, `Token not found in header`, {}, {}))

            console.log(err)
            return res.status(401).json(new apiResponse(401, "Invalid Token", {}, {}))
        }
    }
}

export const adminAccess = async (req: Request, res: Response, next) => {
    try {
        let admin: any = req.header('user')
        if (admin.type != 1) return res.status(403).json(new apiResponse(403, "Access denied", {}, {}))
        next()
    } catch (err) {
        if (err.message == "invalid signature") return res.status(403).json(new apiResponse(403, `Don't try different one token`, {}, {}))
        console.log(err)
        return res.status(500).json(new apiResponse(500, "Admin access internal server error", {}, {}))
    }
}

export async function verifyJwt(authorization: string): Promise<any> {
    return await jwt.verify(authorization, jwt_token_secret);
}