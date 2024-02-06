import express from 'express'
import expressSession from 'express-session'
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { prisma } from '../utils/prisma/index.js';
import { Prisma } from '@prisma/client';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { request } from 'http';

dotenv.config();

// transporter 생성
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GOOGLE_ID,
        pass: process.env.GOOGLE_PASS
    }
})

// 이메일 인증 미들웨어
const emailVerificationMiddleware = async (req, res, next) => {
    try{
    const { email, password, name, confirmpassword } = req.body; 
    console.log(req.body)
    if(!email || !password || !confirmpassword || !name ){
        return res.status(400).json({message: '모든 필드를 입력해주세요'})
    }
    if(password.length < 6){
        return res.status(400).json({ message: '비밀번호는 최소 6자 이상이여야 합니다'})
    }
    if(password !== confirmpassword){
        return res.status(400).json({message: '비밀번호가 일치하지 않습니다.'});
    }
    const isExistUser = await prisma.users.findFirst({
        where: { email : email }
    })

    if(isExistUser){
        return res.status(409).json({message: '이미 있는 이메일 입니다.'});
    }

     // 이메일 인증 토큰 생성 및 메일 발송
    const emailToken = crypto.randomBytes(64).toString('hex');

    const mailOptions = {
        from: 'ahwlsqja1324@gmail.com',
        to: email,
        subject: '이메일 인증을 위한 메일입니다',
        html: `<a href="http://localhost:3018/api/user-sign-up/verify?token=${emailToken}&email=${email}">여기</a>를 클릭하여 이메일을 인증해주세요.`
    };

    transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
    });

    // 비번 해시화 
    console.log("affafafasfasdfdfdsafd");
    console.log(req.session);
    const hashedPassword =await bcrypt.hash(password, 10);
    // 세션에 사용자 정보와 이메일 토큰 저장
    req.session.tempUser ={
        email: req.body.email,
        password: hashedPassword,
        name: req.body.name,
        emailToken: emailToken,
    };
    return res.status(201).json({ message: '인증메일을 발송했습니다..'});
}catch(err){
        next(err);
}
    next();
};

export default emailVerificationMiddleware;