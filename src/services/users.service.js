import { UsersRepository } from "../repositories/users.repository";
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken";
dotenv.config();


export class UsersService {
    usersRepository = new UsersRepository();

    signUp = async (email, password, name, confirmpassword) => {
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
        return user;
    }

    verifySignUp = async ( email, verifiedusertoken) => {
        const user = await this.usersRepository.findUserByEmail(email);
        if(!user.emailTokens){
            throw new Error('인증번호가 업습');
        }

        if(verifiedusertoken !== user.emailTokens){
            throw new Error('실패했습니다.');
        }
        await this.usersRepository.updateUserVerificationStatus(user.userId);
    }

    signUpAdmin = async (email, password, name, confirmpassword, adminKey) => {
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
    }

    signIn = async (email, password) => {
        user = await this.usersRepository.findUserByEmail(email);
        if(!user){
            throw new Error('존재하지 않는 이메일입니다.');
        }
        if(!(await bcrypt.compare(password, user.password))){
            throw new Error('비밀번호가 일치하지 않습니다.');
        }
        const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, { expiresIn: '12h'});
        const refreshToken = jwt.sign({ userId: user.userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
        return { token, refreshToken };

    }

    refreshToken = async (refreshToken) => {
        if(!refreshToken){
            throw new Error('리프레쉬 토큰이 없습니다.');
        }
        try {
            const { userId } = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
            const newToken = jwt.sign({ userId: userId }, process.env.JWT_SECRET, { expiresIn: '12h' });
            return newToken;
        } catch(error) {
            throw new Error('리프레시 토큰이 유효하지 않습니다.');
        }
    }

    getUser = async (userId) => {
        const user = await this.usersRepository.getUserById(userId);
        return user;
    }


    updateUser = async (userId, updatedData) => {
        const userInfo = await this.usersRepository.getUserInfoById(userId);
        if(!userInfo) throw new Error("사용자 정보가 존재하지 않습니다.");
        await this.usersRepository.updateUserInfoAndCreateHistory(userId, userInfo, updatedData);
    }

}

