import express from 'express';
import { Userscontroller } from '../controllers/users.controll.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();
const userscontroller = new Userscontroller();

// 유저 생성
router.post('/user-sign-up', userscontroller.signUp);

// 이메일 인증 API
router.put('/user-sign-up', userscontroller.verifySignUp);

// 관리자 회원가입 API
router.post('/admin-sign-up', userscontroller.AdminsignUp)

// 로그인 API
router.post('/sign-in', userscontroller.signIn)

// 재발급 토큰 API
router.post('/refresh-token', userscontroller.refreshToken)

// 유저 조회
router.get('/users', authMiddleware, userscontroller.getUser)

// 유저 수정
router.patch('/users', authMiddleware, userscontroller.getUser)
