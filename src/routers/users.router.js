import express from 'express';
import { prisma } from "../utils/prisma/index.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken';
import authMiddleware from '../middlewares/auth.middleware.js';
import { Prisma } from '@prisma/client';
import dotenv from 'dotenv';
import emailVerification from '../middlewares/emailVerification.middleware.js';
import userController from "swagger-ui-express"
import axios from 'axios';

dotenv.config();

const router = express.Router();

/**
 * @swagger
 * /api/user-sign-up-email:
 *   post:
 *     summary: 사용자 이메일 회원가입
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 description: 사용자 이메일
 *     responses:
 *       200:
 *         description: 이메일 인증 메일을 보냈습니다. 이메일을 확인해 주세요.
 *       400:
 *         description: 잘못된 요청입니다.
 */
router.post('/user-sign-up-email', emailVerification, (req, res, next) => {
    res.status(200).json({ message: '이메일 인증 메일을 보냈습니다. 이메일을 확인해 주세요.' });
  });

router.get("/oauth", (req, res) => {
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${process.env.KAKAO_APIKEY}&redirect_uri=${process.env.KAKAO_URL}&response_type=code`;
    res.redirect(kakaoAuthUrl);
  });

router.get("/oauth/callback", async (req, res) => {
  const code = req.query.code;
  const tokenRequest = await axios({
    method: "POST",
    url: "https://kauth.kakao.com/oauth/token",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    data: {
      grant_type: "authorization_code",
      client_id: process.env.KAKAO_APIKEY,
      redirect_uri: process.env.KAKAO_URL,
      code,
    },
  }); //axios를 이용하여 예제1을 기준으로 작성하여 카카오 서버에 토큰 요청을 보냅니다.
  
  const { access_token } = tokenRequest.data;
  // 카카오 서버에서 액세스 토큰을 반환합니다.
  const profileRequest = await axios({
    method: "GET",
    url: "https://kapi.kakao.com/v2/user/me",
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });// axios를 이용하여 예제2를 기준으로 작성하여 카카오 서버에 토큰 요청을 보냅니다.

  const { email, profile } = profileRequest.data.kakao_account;
  const name = profile.nickname;
//카카오 서버에서 프로필에 있는 이메일과 이름을 추출합니다.

  const users = await prisma.users.upsert({
    where: { email },
    update: { email, name },
    create: { email, name, password: "default"},
  }); 
  //이후 사용자 정보를 저장합니다.

  const userJWT = jwt.sign({ userId: users.id }, process.env.JWT_SECRET);
  res.cookie("authorization", `Bearer ${userJWT}`);

  return res.status(200).json({ message: "로그인 성공" });
});


/**
 * @swagger
 * /user-sign-up:
 *   post:
 *     summary: 사용자 회원가입
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - confirmpassword
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 description: 사용자 이메일
 *               password:
 *                 type: string
 *                 description: 사용자 비밀번호
 *               confirmpassword:
 *                 type: string
 *                 description: 비밀번호 확인
 *               name:
 *                 type: string
 *                 description: 사용자 이름
 *     responses:
 *       201:
 *         description: 회원가입이 완료되었습니다.
 *       400:
 *         description: 모든 필드를 입력해주세요 / 비밀번호는 최소 6자 이상이여야 합니다 / 비밀번호가 일치하지 않습니다.
 *       409:
 *         description: 이미 있는 이메일입니다.
 */
router.post('/user-sign-up', async (req, res, next) => {
    try{
    const { email, password, name,client_id,confirmpassword } = req.body; 
    if(!client_id){
        if(!email || !password || !confirmpassword || !name ){
            return res.status(400).json({message: '모든 필드를 입력해주세요'})
        }
        if(password.length < 6){
            return res.status(400).json({ message: '비밀번호는 최소 6자 이상이여야 합니다'})
        }
        if(password !== confirmpassword){
            return res.status(400).json({message: '비밀번호가 일치하지 않습니다.'});
        }
    }

    if(client_id){
        const user_check = await prisma.users.findFirst({
            where: {
                email,
            }
        })
        const [user, userInfo] = await prisma.$transaction(async (tx) => {
            const user = await tx.users.create({
                data: { 
                    client_id,
                    name,
                 }
            })
        
            const userInfo = await tx.userInfos.create({
                data:{
                    userId: user.userId,
                    name,
                }
            });
    
            return [user, userInfo];
        },{
            isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted
        })

    } else{
        const isExistUser = await prisma.users.findFirst({
            where: { email : email }
        })
    
        if(isExistUser){
            return res.status(409).json({message: '이미 있는 이메일 입니다.'});
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const [user, userInfo] = await prisma.$transaction(async (tx) => {
            const user = await tx.users.create({
                data: { 
                    email, 
                    password: hashedPassword,
                    name,
                 }
            })
        
            const userInfo = await tx.userInfos.create({
                data:{
                    userId: user.userId,
                    name,
                }
            });
    
            return [user, userInfo];
        },{
            isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted
        })
    }
    return res.status(201).json({ email, name });
}catch(err){
    next(err);
}

/**
 * @swagger
 * /user-sign-up/verify:
 *   get:
 *     summary: 사용자 이메일 인증
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: 이메일 인증 토큰
 *     responses:
 *       201:
 *         description: 회원가입이 완료되었습니다.
 *       400:
 *         description: 이메일 인증 요청이 잘못되었습니다.
 */
});
router.get('/user-sign-up/verify', async(req, res, next) => {
    console.log("미들웨어에서 온 토큰임");
    const { token } = req.query;
    console.log(token);
    // 세션에서 이메일 토큰이 일치하는 사용자 정보 가져오기
    const tempUser = req.session.tempUser;
    console.log(tempUser);
    if (!tempUser || tempUser.emailToken !== token){
        return res.status(400).json({ message: '이메일 인증 요청이 잘못되었습니다.'});
    }
    //회원가입 처리
    try {
        const [user, userInfo] = await prisma.$transaction(async (tx) => {
        const user = await tx.users.create({
            data: { 
            email: tempUser.email, 
            password: tempUser.password,
            name: tempUser.name
        }
        });

        const userInfo = await tx.userInfos.create({
            data:{
            userId: user.userId,
            name: tempUser.name,
            }
        });

        return [user, userInfo];
        });

    // 세션에서 사용자 정보 삭제
        delete req.session.tempUser;

        return res.status(201).json({ message: '회원가입이 완료되었습니다.' });
    }     catch(err) {
        next(err);
    }
    });


/**
 * @swagger
 * /admin-sign-up:
 *   post:
 *     summary: 관리자 회원가입
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - confirmpassword
 *               - name
 *               - adminKey
 *             properties:
 *               email:
 *                 type: string
 *                 description: 관리자 이메일
 *               password:
 *                 type: string
 *                 description: 관리자 비밀번호
 *               confirmpassword:
 *                 type: string
 *                 description: 비밀번호 확인
 *               name:
 *                 type: string
 *                 description: 관리자 이름
 *               adminKey:
 *                 type: string
 *                 description: 관리자 등록 키
 *     responses:
 *       201:
 *         description: 관리자 등록이 완료되었습니다.
 *       400:
 *         description: 모든 필드를 입력해주세요 / 비밀번호는 최소 6자 이상이여야 합니다 / 비밀번호가 일치하지 않습니다.
 *       403:
 *         description: 관리자 등록 권한이 없습니다.
 *       409:
 *         description: 이미 있는 이메일입니다.
 */
router.post('/admin-sign-up', async (req, res, next) => {
    try{
        const { email, password, name, confirmpassword, adminKey } = req.body; 
        // 관리자 등록 키 확인
        if (adminKey !== process.env.ADMIN_KEY) {
            return res.status(403).json({ message: '관리자 등록 권한이 없습니다.'});
        }
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
    
        const hashedPassword = await bcrypt.hash(password, 10);

        const [user, userInfo] = await prisma.$transaction(async (tx) => {
            const user = await tx.users.create({
                data: {
                    email,
                    name,
                    password: hashedPassword,
                    permission: 'Admin',
                }
            });

        const userInfo = await tx.userInfos.create({
            data: {
                userId: user.userId,
                name,
            }
        });
        return [user, userInfo];
        },{
            isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted
        })

        return res.status(201).json({ message: '관리자 등록이 완료되었습니다.'});
    }catch(err){
            next(err)
        }
    })


/**
 * @swagger
 * /sign-in:
 *   post:
 *     summary: 사용자 로그인
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: 사용자 이메일
 *               password:
 *                 type: string
 *                 description: 사용자 비밀번호
 *     responses:
 *       200:
 *         description: 로그인에 성공하셨습니다.
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *             description: JWT 토큰과 Refresh 토큰이 담긴 쿠키
 *       401:
 *         description: 존재하지 않는 이메일입니다. / 비밀번호가 일치하지 않습니다.
 */    
router.post('/sign-in', async (req, res, next) => {
    let user;
    const { client_id , email, password } = req.body;
    if(client_id){
        user = await prisma.users.findFirst({
            where: {
                client_id,
            }
        })

        if(!user) {
            return res.status(401).json({ success: false, message: '올바르지 않은 로그인 정보입니다.'});
        }
    } else{
        user = await prisma.users.findFirst({
            where: {
                email,
            }}
            );
        console.log(user);
        if(!user){
            return res.status(401).json({message: '존재하지 않는 이메일입니다.'})
        }
        if (!(await bcrypt.compare(password, user.password)))
            return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.'});

    }
    
        // JWT 생성하기
        const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, { expiresIn: '12h' });


        // refresh TOKEN 생성
        const refreshToken = jwt.sign({ userId: user.userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

    
        res.cookie('authorization', `Bearer ${token}`);
        res.cookie('refreshToken',`Bearer ${refreshToken}`)

        return res.status(200).json({ message: '로그인에 성공하셨습니다.', token });
}) 

/**
 * @swagger
 * /refresh-token:
 *   post:
 *     summary: 토큰 재발급
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: 새로운 토큰 재발급에 성공했습니다.
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *             description: 재발급된 JWT 토큰이 담긴 쿠키
 *       401:
 *         description: 리프레쉬 토큰이 없습니다. / 리프레시 토큰이 유효하지 않습니다.
 */
router.post('/refresh-token', async(req, res, next) => {
    const { refreshToken } = req.cookies;

    if(!refreshToken){
        return res.status(401).json({ message: '리프레쉬 토큰이 없습니다.'});
    }

    try{
        const { userId } = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
        // 재발급할 액서스 토큰 생성  
        const newToken = jwt.sign({ userId: userId }, process.env.JWT_SECRET, { expiresIn: '12h' });

        // 재발급된 엑세스 토큰 저장
        res.cookie('authorization', `Bearer ${newToken}`);
        
        return res.status(200).json({ message: '새로운 토큰 재발급에 성공했습니다.'});
    }catch(error){
        return res.status(401).json({ message: '리프레시 토큰이 유효하지 않습니다.'});
    }
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: 사용자 정보 조회
 *     tags: [Users]
 *     security: 
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 사용자 정보 조회에 성공했습니다.
 *         content: 
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/User'
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         userId:
 *           type: integer
 *           description: 사용자 ID
 *         email:
 *           type: string
 *           description: 사용자 이메일
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 계정 생성 시각
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 계정 수정 시각
 *         userInfos:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               description: 사용자 이름
 */
router.get('/users', authMiddleware, async (req, res, next) => {
    const { userId } = req.user;

    const user = await prisma.users.findFirst({
        where: { userId: +userId},
        select: {
            userId: true,
            email: true,
            createdAt: true,
            updatedAt: true,
            userInfos: {
                select: {
                    name: true,
                }
            }
        }
    });

    return res.status(200).json({ data: user });
})

/**
 * @swagger
 * /users:
 *   patch:
 *     summary: 사용자 정보 변경
 *     tags: [Users]
 *     security: 
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 변경하고자 하는 사용자 이름
 *     responses:
 *       200:
 *         description: 사용자 정보 변경에 성공했습니다.
 *       404:
 *         description: 사용자 정보가 존재하지 않습니다.
 */
router.patch('/users', authMiddleware,async (req, res, next) => {
    const updatedData = req.body;
    const { userId } = req.user;

    const userInfo = await prisma.userInfos.findFirst({
        where: { userId: +userId }
    });
    if(!userInfo) return res.status(404).json({ message: "사용자 정보가 존재하지 않습니다."})

    await prisma.$transaction(async(tx) => {
        await tx.userInfos.update({
            data: {
                ...updatedData
            },
            where: {
                userId: +userId,
            }
        });

        for(let key in updatedData){
            if(userInfo[key] !== updatedData[key])
            await tx.userHistories.create({
        data:{
            userId: +userId,
            changedField: key,
            oldValue: String(userInfo[key]),
            newValue: String(updatedData[key]),
            }
        });
    }
    },{
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted
    })

    return res.status(200).json({message: "사용자 정보 변경에 성공했습니다."})
})
/**
 * @swagger
 * /logout:
 *   post:
 *     summary: 사용자 로그아웃
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: 로그아웃에 성공하였습니다.
 */
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: '로그아웃에 성공하였습니다.' });
});

router.get('/kakao_logout', async(req,res) => {
    const logout_Url = `https://kauth.kakao.com/oauth/logout?client_id=${process.env.KAKAO_APIKEY}&logout_redirect_uri=${process.env.KAKAO_LOGOUT}`;
    res.redirect(logout_Url);
})



export default router;
