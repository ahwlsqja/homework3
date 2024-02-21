import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { UsersService } from '../../../src/services/users.service.js';
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";


let mockUserRepository = {
    findUserByEmail: jest.fn(),
    createUser: jest.fn(),
    updateUserVerificationStatus: jest.fn(),
    createAdmin: jest.fn(),
    getUserById: jest.fn(),
    getUserInfoById: jest.fn(),
    updateUserInfoAndCreateHistory: jest.fn(),
};

let usersService = new UsersService(mockUserRepository);




describe('UsersService Unit Test', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    })

    test('SignUp Method', async () => {
        const email = 'test@test.com';
        const password = 'password';
        const name = 'Test';
        const confirmpassword = 'password';

        bcrypt.hash.mockResolvedValue('hashedPassword');
        mockUserRepository.createUser.mockResolvedValue({ id: 1, email, name });

        const result = await usersService.signUp(email, password, name, confirmpassword);

        expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
        expect(mockUserRepository.findUserByEmail).toHaveBeenCalledWith(email);
        expect(mockUserRepository.createUser).toHaveBeenCalledWith(email, 'hashedPassword', name);
        expect(result).toEqual({ id: 1, email, name });
    });

    test('SignUp Method - should throw error when email exists', async () => {
        const email = 'test@test.com';
        const password = 'password';
        const name = 'Test';
        const confirmpassword = 'password';

        mockUserRepository.findUserByEmail.mockResolvedValue({});

        await expect(usersService.signUp(email, password, name, confirmpassword)).rejects.toThrow('이미 있는 이메일 입니다.');
    });

    test('verifySignUp Method', async () => {
        const email = 'test@test.com';
        const verifiedusertoken = 'verifiedusertoken';

        const mockUser = {
            userId: 1,
            email,
            emailTokens: verifiedusertoken,
        };

        mockUserRepository.findUserByEmail.mockResolvedValue(mockUser);

        await usersService.verifySignUp(email, verifiedusertoken);

        expect(mockUserRepository.findUserByEmail).toHaveBeenCalledWith(email);
        expect(mockUserRepository.updateUserVerificationStatus).toHaveBeenCalledWith(mockUser.userId);
    });

    test('verifySignUp Method - should throw error when email token does not exist', async () => {
        const email = 'test@test.com';
        const verifiedusertoken = 'verifiedusertoken';

        const mockUser = {
            userId: 1,
            email,
            emailTokens: null,
        };

        mockUserRepository.findUserByEmail.mockResolvedValue(mockUser);

        await expect(usersService.verifySignUp(email, verifiedusertoken)).rejects.toThrow('인증번호가 업습');
    });

    test('verifySignUp Method - should throw error when verified user token does not match', async () => {
        const email = 'test@test.com';
        const verifiedusertoken = 'verifiedusertoken';

        const mockUser = {
            userId: 1,
            email,
            emailTokens: 'differenttoken',
        };

        mockUserRepository.findUserByEmail.mockResolvedValue(mockUser);

        await expect(usersService.verifySignUp(email, verifiedusertoken)).rejects.toThrow('실패했습니다.');
    });

    test('signUpAdmin Method', async () => {
        const adminKey = process.env.ADMIN_KEY;
        const email = 'admin@test.com';
        const password = 'password';
        const name = 'Admin';
        const confirmpassword = 'password';

        bcrypt.hash.mockResolvedValue('hashedPassword');
        mockUserRepository.createAdmin.mockResolvedValue();

        await usersService.signUpAdmin(email, password, name, confirmpassword, adminKey);

        expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
        expect(mockUserRepository.findUserByEmail).toHaveBeenCalledWith(email);
        expect(mockUserRepository.createAdmin).toHaveBeenCalledWith(email, 'hashedPassword', name);
    });

    test('signUpAdmin Method - should throw error when adminKey is not valid', async () => {
        const adminKey = 'invalidAdminKey';
        const email = 'admin@test.com';
        const password = 'password';
        const name = 'Admin';
        const confirmpassword = 'password';

        await expect(usersService.signUpAdmin(email, password, name, confirmpassword, adminKey)).rejects.toThrow('관리자 등록 권한이 없습니다.');
    });

    test('signIn Method', async () => {
        const email = 'test@test.com';
        const password = 'password';

        const mockUser = {
            userId: 1,
            email,
            password: 'hashedPassword',
        };

        mockUserRepository.findUserByEmail.mockResolvedValue(mockUser);
        

        const result = await usersService.signIn(email, password);

        expect(mockUserRepository.findUserByEmail).toHaveBeenCalledWith(email);
        expect(result).toEqual({
            token: `${mockUser.userId}-process.env.JWT_SECRET`,
            refreshToken: `${mockUser.userId}-process.env.JWT_REFRESH_SECRET`,
        });
    });

    test('signIn Method - should throw error when email does not exist', async () => {
        const email = 'test@test.com';
        const password = 'password';

        mockUserRepository.findUserByEmail.mockResolvedValue(null);

        await expect(usersService.signIn(email, password)).rejects.toThrow('존재하지 않는 이메일입니다.');
    });

    test('signIn Method - should throw error when password does not match', async () => {
        const email = 'test@test.com';
        const password = 'password';

        const mockUser = {
            userId: 1,
            email,
            password: 'hashedPassword',
        };

        mockUserRepository.findUserByEmail.mockResolvedValue(mockUser);
        bcrypt.compare.mockResolvedValue(false);

        await expect(usersService.signIn(email, password)).rejects.toThrow('비밀번호가 일치하지 않습니다.');
    });

    test('refreshToken Method', async () => {
        const refreshToken = 'refreshToken';

        jwt.verify.mockReturnValue({ userId: 1 });
        jwt.sign.mockImplementation((payload, secret, options) => `${payload.userId}-${secret}`);

        const result = await usersService.refreshToken(refreshToken);

        expect(jwt.verify).toHaveBeenCalledWith(refreshToken, process.env.JWT_REFRESH_SECRET);
        expect(jwt.sign).toHaveBeenCalledWith({ userId: 1 }, process.env.JWT_SECRET, { expiresIn: '12h' });
        expect(result).toEqual('1-process.env.JWT_SECRET');
    });

    test('refreshToken Method - should throw error when refreshToken is not provided', async () => {
        await expect(usersService.refreshToken()).rejects.toThrow('리프레쉬 토큰이 없습니다.');
    });

    test('refreshToken Method - should throw error when refreshToken is not valid', async () => {
        const refreshToken = 'invalidRefreshToken';

        jwt.verify.mockImplementation(() => { throw new Error(); });

        await expect(usersService.refreshToken(refreshToken)).rejects.toThrow('리프레쉬 토큰이 유효하지 않습니다.');
    });

    test('getUser Method', async () => {
        const userId = 1;

        const mockUser = {
            userId,
            email: 'test@test.com',
            name: 'Test',
        };

        mockUserRepository.getUserById.mockResolvedValue(mockUser);

        const result = await usersService.getUser(userId);

        expect(mockUserRepository.getUserById).toHaveBeenCalledWith(userId);
        expect(result).toEqual(mockUser);
    });

    test('updateUser Method', async () => {
        const userId = 1;
        const updatedData = { name: 'Updated' };

        const mockUser = {
            userId,
            email: 'test@test.com',
            name: 'Test',
        };

        mockUserRepository.getUserInfoById.mockResolvedValue(mockUser);
        mockUserRepository.updateUserInfoAndCreateHistory.mockResolvedValue();

        await usersService.updateUser(userId, updatedData);

        expect(mockUserRepository.getUserInfoById).toHaveBeenCalledWith(userId);
        expect(mockUserRepository.updateUserInfoAndCreateHistory).toHaveBeenCalledWith(userId, mockUser, updatedData);
    });

    test('updateUser Method - should throw error when user does not exist', async () => {
        const userId = 1;
        const updatedData = { name: 'Updated' };

        mockUserRepository.getUserInfoById.mockResolvedValue(null);

        await expect(usersService.updateUser(userId, updatedData)).rejects.toThrow('사용자 정보가 존재하지 않습니다.');
    });
})