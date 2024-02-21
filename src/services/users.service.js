import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken";
import { sendTodayData } from "../middlewares/slackBot.js"

import "dotenv/config";



export class UsersService {
    constructor(usersRepository){
        this.usersRepository = usersRepository;
    }

    signUp = async (email, password, name, confirmpassword) => {
        await new Promise((resolve) => setTimeout(resolve, 2000)); 
        
        if(!email || !password || !confirmpassword || !name) {
            throw new Error('모든 필드를 입력해주세요.');
        }

        if(password.length < 6){
            throw new Error('비밀번호는 최소 6자 이상이여야 합니다.');
        }
        
        if(password !== confirmpassword){
            throw new Error('비밀번호가 일치하지 않습니다.');
        }
        
        const isExistUser = await this.usersRepository.findUserByEmail(email);
        if(isExistUser){
            throw new Error('이미 있는 이메일 입니다.');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await this.usersRepository.createUser(email, hashedPassword, name);
        try{
            await sendTodayData();
        } catch(err){
            next(err);
        }
        return user;
    }

    verifySignUp = async ( email, verifiedusertoken) => {
        await new Promise((resolve) => setTimeout(resolve, 2000)); 

        const user = await this.usersRepository.findUserByEmail(email);
        if(!user.emailTokens){
            throw new Error('인증번호가 업습');
        }

        if(verifiedusertoken !== user.emailTokens){
            throw new Error('실패했습니다.');
        }
        await this.usersRepository.updateUserVerificationStatus(user.userId);
        try{
            await sendTodayData();
        } catch(err){
            next(err);
        }
    }

    signUpAdmin = async (email, password, name, confirmpassword, adminKey) => {
        await new Promise((resolve) => setTimeout(resolve, 2000)); 

        if (adminKey !== process.env.ADMIN_KEY) {
            throw new Error('관리자 등록 권한이 없습니다.');
        }
        if(!email || !password || !confirmpassword || !name ){
            throw new Error('모든 필드를 입력해주세요');
        }
        if(password.length < 6){
            throw new Error('비밀번호는 최소 6자 이상이여야 합니다');
        }
        if(password !== confirmpassword){
            throw new Error('비밀번호가 일치하지 않습니다.');
        }
        const isExistUser = await this.usersRepository.findUserByEmail(email);
        if(isExistUser){
            throw new Error('이미 있는 이메일 입니다.');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await this.usersRepository.createAdmin(email, hashedPassword, name);
        try{
            await sendTodayData();
        } catch(err){
            next(err);
        }
    }

    signIn = async (email, password) => {
        await new Promise((resolve) => setTimeout(resolve, 2000)); 

        const user = await this.usersRepository.findUserByEmail(email);
        if(!user){
            throw new Error('존재하지 않는 이메일입니다.');
        }
        if(!(await bcrypt.compare(password, user.password))){
            throw new Error('비밀번호가 일치하지 않습니다.');
        }
        const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, { expiresIn: '12h'});
        const refreshToken = jwt.sign({ userId: user.userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

        await this.usersRepository.saveToken(user.userId, refreshToken);

        try{
            await sendTodayData();
        } catch(err){
            next(err);
        }

        return { token, refreshToken };

    }

    refreshToken = async (refreshToken) => {
        await new Promise((resolve) => setTimeout(resolve, 2000)); 

        if(!refreshToken){
            throw new Error('리프레쉬 토큰이 없습니다.');
        }
        try {
            const { userId } = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

            const savedRefreshToken = await this.usersRepository.getToken(userId);
            if(refreshToken !== savedRefreshToken){
                throw new Error("리프레쉬 토큰이 유효하지 않습니다.");
            }
            const newToken = jwt.sign({ userId: userId }, process.env.JWT_SECRET, { expiresIn: '12h' });
            const newRefreshToken = jwt.sign({ userId: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

            await this.usersRepository.saveToken(userId, newRefreshToken);

            return { newToken, newRefreshToken };
        } catch(error) {
            throw new Error('리프레시 토큰이 유효하지 않습니다.');
        }
        
    }

    getUser = async (userId) => {
        await new Promise((resolve) => setTimeout(resolve, 2000)); 

        const user = await this.usersRepository.getUserById(userId);
        try{
            await sendTodayData();
        } catch(err){
            next(err);
        }
        return user;
    }


    updateUser = async (userId, updatedData) => {
        await new Promise((resolve) => setTimeout(resolve, 2000)); 

        const userInfo = await this.usersRepository.getUserInfoById(userId);
        if(!userInfo) throw new Error("사용자 정보가 존재하지 않습니다.");
        await this.usersRepository.updateUserInfoAndCreateHistory(userId, userInfo, updatedData);
        try{
            await sendTodayData();
        } catch(err){
            next(err);
        }
    }

}

