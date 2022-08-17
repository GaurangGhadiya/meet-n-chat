"use strict"
import * as Joi from "joi"
import { apiResponse } from '../common'
import { isValidObjectId } from 'mongoose'
import { Request, Response } from 'express'
import { responseMessage } from "../helpers/response"

export const signUp = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        name: Joi.string().required().error(new Error('name is required!')),
        email: Joi.string().required().error(new Error('email is required!')),
        password: Joi.string().required().error(new Error('password is required!')),
        // address: Joi.string().required().error(new Error('address is required!')),
        // latitude: Joi.number().required().error(new Error('latitude is required!')),
        // longitude: Joi.number().required().error(new Error('longitude is required!')),
    })
    schema.validateAsync(req.body).then(result => {
        return next()
    }).catch(error => {
        res.status(400).json(new apiResponse(400, error.message, {}, {}))
    })
}

export const login = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        email: Joi.string().required().error(new Error('email is required!')),
        password: Joi.string().required().error(new Error('password is required!')),
    })
    schema.validateAsync(req.body).then(result => {
        return next()
    }).catch(error => {
        res.status(400).json(new apiResponse(400, error.message, {}, {}))
    })
}
export const forgot_password = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        email: Joi.string().lowercase().max(50).required().error(new Error('email is string! & max length is 50')),
        // phoneNumber: Joi.string().lowercase().max(50).required().error(new Error('phoneNumber is string! & max length is 50')),
    })
    schema.validateAsync(req.body).then(result => {
        req.body = result
        return next()
    }).catch(error => {
        res.status(400).json(new apiResponse(400, error.message, {}, {}))
    })
}

export const reset_password = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        id: Joi.string().required().error(new Error('id is required!')),
        password: Joi.string().max(20).required().error(new Error('password is required! & max length is 20')),
        otp: Joi.number().required().error(new Error('otp is required!')),
    })
    schema.validateAsync(req.body).then(result => {
        if (!isValidObjectId(result.id)) return res.status(400).json(new apiResponse(400, 'invalid id', {}, {}))
        return next()
    }).catch(error => {
        res.status(400).json(new apiResponse(400, error.message, {}, {}))
    })
}

export const otp_verification = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        otp: Joi.number().min(1000).max(9999).required().error(new Error('otp is required! & only is 4 digits'))
    })
    schema.validateAsync(req.body).then(result => {
        return next()
    }).catch(error => {
        res.status(400).json(new apiResponse(400, error.message, {}, {}))
    })
}

export const resend_otp = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        email: Joi.string().required().error(new Error('email is string! ')),
    })
    schema.validateAsync(req.body).then(result => {
        return next()
    }).catch(error => {
        res.status(400).json(new apiResponse(400, error.message, {}, {}))
    })
}