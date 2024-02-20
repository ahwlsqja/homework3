import { UsersService } from '../services/users.service.js';

export class Userscontroller {
    usersService = new UsersService();

    // 유저 생성 API
    signUp = async (req, res, next) => {
        try {
            const { email, password, name, confirmpassword } = req.body;
            const user = await this.usersService.signUp(email, password, name, confirmpassword);
            return res.status(201).json(user);
        } catch (err) {
            next(err);
        }
    }
    // 이메일 인증 API
    verifySignUp = async (req, res, next) => {
        try {
            const { email, verifiedusertoken } = req.body;
            await this.usersService.verifySignUp(email, verifiedusertoken);
            return res.status(200).json({ message: "인증에 성공했습니다."});
        } catch (err) {
            next(err);
        }
    }
    // 관리자 회원가입 API
    AdminsignUp = async (req, res, next) => {
        try {
            const { email, password, name, confirmpassword, adminKey } = req.body;
            await this.usersService.signUp(email, password, name, confirmpassword, adminKey);
            return res.status(201).json({ message: '관리자 등록이 완료되었습니다.'});
        } catch (err) {
            next(err);
        }
    }

    // 로그인 API
    signIn = async (req, res, next) => {
        try {
            const { email, password } = req.body;
            const tokens = await this.usersService.signIn(email, password);
            res.cookie('authorization', `Bearer ${tokens.token}`);
            res.cookie('refreshToken', `Bearer ${tokens.refreshToken}`);
            return res.status(200).json({ message: '로그인에 성공하셨습니다.', token: tokens.token})
        } catch (err) {
            next(err);
        }
    }
    // 재발급 토큰 API
    refreshToken = async (req, res, next) => {
        try{
            const { refreshToken } = req.cookies;
            const newToken = await this.usersService.refreshToken(refreshToken);
            res.cookie('authorization', `Bearer ${newToken}`)
            return res.status(200).json({ message: '새로운 토큰 재발급에 성공했습니다.'});
        } catch(err){
            next(err);
        }

    }

    getUser = async (req, res, next) => {
        try {
            const { userId } = req.user;
            const user = await this.usersService.getUser(userId);
            return res.status(200).json({ data: user });

        }catch(err){
            next(err);
        }
    }

    updateUser = async (req, res, next) => {
        try{
        const updatedData = req.body;
        const { userId } = req.user;
        await this.usersService.updateUser(userId, updatedData);
        return res.status(200).json({message: "사용자 정보 변경에 성공했습니다."});
    } catch (err) {
        next(err);
    }
    }
}