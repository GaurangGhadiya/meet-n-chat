const mongoose = require('mongoose')

const userSchema: any = new mongoose.Schema({
    name: { type: String, default: null },
    email: { type: String, default: null },
    phoneNumber: { type: String, default: null },
    password: { type: String, default: null },
    // image: { type: String, default: null },
    // address: { type: String, default: null },
    // latitude: { type: Number, default: null },
    // longitude: { type: Number, default: null },
    authToken: { type: Number, default: null },
    otp: { type: Number, default: null },
    otpExpireTime: { type: Date, default: null },
    isEmailVerified: { type: Boolean, default: false },
    loginType: { type: Number, default: 0, enum: [0, 1] }, // 0 - custom || 1 - google
    userType: { type: Number, default: 0, enum: [0, 1] }, // 0 - user || 1 - admin 
    lastLogin: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
}, { timestamps: true }
)

export const userModel = mongoose.model('user', userSchema);