// import express from 'express';
// import { prisma } from "../utils/prisma/index.js";
// import bcrypt from 'bcrypt'
// import jwt from 'jsonwebtoken';
// import authMiddleware from '../middlewares/auth.middleware.js';
// import { Prisma } from '@prisma/client';
// import dotenv from 'dotenv';
// import axios from 'axios';
// import emailVerificationMiddleware from '../middlewares/emailVerification.middleware.js';

// dotenv.config();

// const router = express.Router();


// router.post('/user-sign-up', async (req, res, next) => {
//     try{
//     const { email, password, name, confirmpassword } = req.body; 
//     if(!email || !password || !confirmpassword || !name ){
//         return res.status(400).json({message: '모든 필드를 입력해주세요'})
//     }
//     if(password.length < 6){
//         return res.status(400).json({ message: '비밀번호는 최소 6자 이상이여야 합니다'})
//     }
//     if(password !== confirmpassword){
//         return res.status(400).json({message: '비밀번호가 일치하지 않습니다.'});
//     }
//     const isExistUser = await prisma.users.findFirst({
//             where: { email : email }
//     })
    
//     if(isExistUser){
//         return res.status(409).json({message: '이미 있는 이메일 입니다.'});
//     }
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const [user, userInfo] = await prisma.$transaction(async (tx) => {
//         const token = Math.floor(Math.random() * 900000) + 100000;
//         const user = await tx.users.create({
//             data: { 
//                 email, 
//                 password: hashedPassword,
//                 name,
//                 verifiedstatus: "nonpass",
//                 emailToken: token.toString(),
//                 }
//         })
        
//             const userInfo = await tx.userInfos.create({
//                 data:{
//                     userId: user.userId,
//                     name,
//                 }
//             });
//             await emailVerificationMiddleware(email, token)
//             return [user, userInfo];
//         },{
//             isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted
//         })
//     return res.status(201).json({ email, name });
// }catch(err){
//     next(err);
// }

// });

// router.put('/user-sign-up', async(req, res, next) => {
//     try{
//     const { email, verifiedusertoken } = req.body; 
//     console.log("이메일 인증 토큰임");
//     const isExistUser = await prisma.users.findFirst({
//         where: { email : email }
//     })
//     if(!isExistUser.emailTokens){
//         return res.status(400).json({message: '인증번호가 일치하지 않습니다.'});

//     }

//     if(verifiedusertoken === isExistUser.emailTokens){
//         await prisma.users.update({
//             where: { userId: isExistUser.userId },
//             data: { verifiedstatus: "pass" },
//           });
//     }
//     else{
//         return res.status(400).json({message: '실패했습니다.'});
//     }
//     }catch(err) {
//         next(err);
//     }
//     });


// router.post('/admin-sign-up', async (req, res, next) => {
//     try{
//         const { email, password, name, confirmpassword, adminKey } = req.body; 
//         // 관리자 등록 키 확인
//         if (adminKey !== process.env.ADMIN_KEY) {
//             return res.status(403).json({ message: '관리자 등록 권한이 없습니다.'});
//         }
//         if(!email || !password || !confirmpassword || !name ){
//             return res.status(400).json({message: '모든 필드를 입력해주세요'})
//         }
//         if(password.length < 6){
//             return res.status(400).json({ message: '비밀번호는 최소 6자 이상이여야 합니다'})
//         }
//         if(password !== confirmpassword){
//             return res.status(400).json({message: '비밀번호가 일치하지 않습니다.'});
//         }
//         const isExistUser = await prisma.users.findFirst({  
//             where: { email : email }
//         })
    
//         if(isExistUser){
//             return res.status(409).json({message: '이미 있는 이메일 입니다.'});
//         }
    
//         const hashedPassword = await bcrypt.hash(password, 10);

//         const [user, userInfo] = await prisma.$transaction(async (tx) => {
//             const user = await tx.users.create({
//                 data: {
//                     email,
//                     name,
//                     password: hashedPassword,
//                     permission: 'Admin',
//                 }
//             });

//         const userInfo = await tx.userInfos.create({
//             data: {
//                 userId: user.userId,
//                 name,
//             }
//         });
//         return [user, userInfo];
//         },{
//             isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted
//         })

//         return res.status(201).json({ message: '관리자 등록이 완료되었습니다.'});
//     }catch(err){
//             next(err)
//         }
//     })

  
// router.post('/sign-in', async (req, res, next) => {
//     let user;
//     const { email, password } = req.body;
//         user = await prisma.users.findFirst({
//             where: {
//                 email,
//             }}
//             );
//         console.log(user);
//         if(!user){
//             return res.status(401).json({message: '존재하지 않는 이메일입니다.'})
//         }
//         if (!(await bcrypt.compare(password, user.password)))
//             return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.'});
    
    
//         // JWT 생성하기
//         const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, { expiresIn: '12h' });


//         // refresh TOKEN 생성
//         const refreshToken = jwt.sign({ userId: user.userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

    
//         res.cookie('authorization', `Bearer ${token}`);
//         res.cookie('refreshToken',`Bearer ${refreshToken}`)

//         return res.status(200).json({ message: '로그인에 성공하셨습니다.', token });
//     }) 


// router.post('/refresh-token', async(req, res, next) => {
//     const { refreshToken } = req.cookies;

//     if(!refreshToken){
//         return res.status(401).json({ message: '리프레쉬 토큰이 없습니다.'});
//     }

//     try{
//         const { userId } = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
//         // 재발급할 액서스 토큰 생성  
//         const newToken = jwt.sign({ userId: userId }, process.env.JWT_SECRET, { expiresIn: '12h' });

//         // 재발급된 엑세스 토큰 저장
//         res.cookie('authorization', `Bearer ${newToken}`);
        
//         return res.status(200).json({ message: '새로운 토큰 재발급에 성공했습니다.'});
//     }catch(error){
//         return res.status(401).json({ message: '리프레시 토큰이 유효하지 않습니다.'});
//     }
// });

// router.get('/users', authMiddleware, async (req, res, next) => {
//     const { userId } = req.user;

//     const user = await prisma.users.findFirst({
//         where: { userId: +userId},
//         select: {
//             userId: true,
//             email: true,
//             createdAt: true,
//             updatedAt: true,
//             userInfos: {
//                 select: {
//                     name: true,
//                 }
//             }
//         }
//     });

//     return res.status(200).json({ data: user });
// })

// router.patch('/users', authMiddleware,async (req, res, next) => {
//     const updatedData = req.body;
//     const { userId } = req.user;

//     const userInfo = await prisma.userInfos.findFirst({
//         where: { userId: +userId }
//     });
//     if(!userInfo) return res.status(404).json({ message: "사용자 정보가 존재하지 않습니다."})

//     await prisma.$transaction(async(tx) => {
//         await tx.userInfos.update({
//             data: {
//                 ...updatedData
//             },
//             where: {
//                 userId: +userId,
//             }
//         });

//         for(let key in updatedData){
//             if(userInfo[key] !== updatedData[key])
//             await tx.userHistories.create({
//         data:{
//             userId: +userId,
//             changedField: key,
//             oldValue: String(userInfo[key]),
//             newValue: String(updatedData[key]),
//             }
//         });
//     }
//     },{
//         isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted
//     })

//     return res.status(200).json({message: "사용자 정보 변경에 성공했습니다."})
// })

// router.post('/logout', (req, res) => {
//     res.clearCookie('token');
//     res.status(200).json({ message: '로그아웃에 성공하였습니다.' });
// });

// router.get('/kakao_logout', async(req,res) => {
//     const logout_Url = `https://kauth.kakao.com/oauth/logout?client_id=${process.env.KAKAO_APIKEY}&logout_redirect_uri=${process.env.KAKAO_LOGOUT}`;
//     res.redirect(logout_Url);
// })



export default router;
