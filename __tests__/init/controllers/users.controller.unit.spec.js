import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { UsersController } from "../../../src/controllers/users.controll.js"
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const mockUsersService = {
    signUp: jest.fn(),
    verifySignUp: jest.fn(),
    signUpAdmin: jest.fn(),
    signIn: jest.fn(),
    refreshToken: jest.fn(),
    getUser: jest.fn(),
    updateUser: jest.fn(),
};

const mockRequest = {
    body: jest.fn(),
};
const mockResponse = {
    status: jest.fn(),
    json: jest.fn(),
};

const mockNext = jest.fn();
const userController = new UsersController(mockUsersService);

describe('Users Controller Unit Test', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        mockResponse.status.mockReturnValue(mockResponse);
    });
    test('signUp', async () => {
        const mockEmail = 'test@test.com';
        const mockPassword = 'password123';
        const mockName = 'Test User';
        const mockConfirmPassword = 'password123';
    
        mockRequest.body = {
            email: mockEmail,
            password: mockPassword,
            name: mockName,
            confirmpassword: mockConfirmPassword
        };
    
        const mockUser = {
            id: 1,
            email: mockEmail,
            name: mockName
        };
    
        mockUsersService.signUp.mockResolvedValue(mockUser);
    
        await userController.signUp(mockRequest, mockResponse, mockNext);
    
        expect(mockUsersService.signUp).toHaveBeenCalledWith(mockEmail, mockPassword, mockName);
        expect(mockUsersService.signUp).toHaveBeenCalledTimes(1);
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith({ user: mockUser });
    });
    
    test('signUp - should throw error when password and confirmpassword do not match', async () => {
        const mockEmail = 'test@test.com';
        const mockPassword = 'password123';
        const mockName = 'Test User';
        const mockConfirmPassword = 'password1234';
    
        mockRequest.body = {
            email: mockEmail,
            password: mockPassword,
            name: mockName,
            confirmpassword: mockConfirmPassword
        };
    
        await expect(userController.signUp(mockRequest, mockResponse, mockNext)).rejects.toThrow('비밀번호가 일치하지 않습니다.');
    });



test('verifySignUp', async () => {
    const mockEmail = 'test@test.com';
    const mockVerifiedUserToken = '123456';
    const mockUser = {
        userId: 1,
        email: mockEmail,
        emailTokens: mockVerifiedUserToken,
    };

    mockRequest.body = {
        email: mockEmail,
        verifiedusertoken: mockVerifiedUserToken,
    };

    mockUsersService.findUserByEmail.mockResolvedValue(mockUser);
    mockUsersService.updateUserVerificationStatus.mockResolvedValue();

    await userController.verifySignUp(mockRequest, mockResponse, mockNext);

    expect(mockUsersService.findUserByEmail).toHaveBeenCalledWith(mockEmail);
    expect(mockUsersService.findUserByEmail).toHaveBeenCalledTimes(1);
    expect(mockUsersService.updateUserVerificationStatus).toHaveBeenCalledWith(mockUser.userId);
    expect(mockUsersService.updateUserVerificationStatus).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).toHaveBeenCalledWith(200);
});

test('verifySignUp - should throw error when emailTokens is not exist', async () => {
    const mockEmail = 'test@test.com';
    const mockVerifiedUserToken = '123456';
    const mockUser = {
        userId: 1,
        email: mockEmail,
    };

    mockRequest.body = {
        email: mockEmail,
        verifiedusertoken: mockVerifiedUserToken,
    };

    mockUsersService.findUserByEmail.mockResolvedValue(mockUser);

    await expect(userController.verifySignUp(mockRequest, mockResponse, mockNext)).rejects.toThrow('인증번호가 없습니다.');
});

test('verifySignUp - should throw error when verifiedusertoken does not match', async () => {
    const mockEmail = 'test@test.com';
    const mockVerifiedUserToken = '123456';
    const mockUser = {
        userId: 1,
        email: mockEmail,
        emailTokens: '654321',
    };

    mockRequest.body = {
        email: mockEmail,
        verifiedusertoken: mockVerifiedUserToken,
    };

    mockUsersService.findUserByEmail.mockResolvedValue(mockUser);

    await expect(userController.verifySignUp(mockRequest, mockResponse, mockNext)).rejects.toThrow('실패했습니다.');
});

test('signUpAdmin', async () => {
    const mockEmail = 'admin@test.com';
    const mockPassword = 'password123';
    const mockName = 'Admin User';
    const mockConfirmPassword = 'password123';
    const mockAdminKey = process.env.ADMIN_KEY;

    mockRequest.body = {
        email: mockEmail,
        password: mockPassword,
        name: mockName,
        confirmpassword: mockConfirmPassword,
        adminKey: mockAdminKey,
    };

    mockUsersService.findUserByEmail.mockResolvedValue(null);
    mockUsersService.createAdmin.mockResolvedValue();

    await userController.signUpAdmin(mockRequest, mockResponse, mockNext);

    expect(mockUsersService.findUserByEmail).toHaveBeenCalledWith(mockEmail);
    expect(mockUsersService.findUserByEmail).toHaveBeenCalledTimes(1);
    expect(mockUsersService.createAdmin).toHaveBeenCalledWith(mockEmail, expect.any(String), mockName);
    expect(mockUsersService.createAdmin).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).toHaveBeenCalledWith(201);
});

test('signUpAdmin - should throw error when adminKey does not match', async () => {
    const mockEmail = 'admin@test.com';
    const mockPassword = 'password123';
    const mockName = 'Admin User';
    const mockConfirmPassword = 'password123';
    const mockAdminKey = 'invalidAdminKey';

    mockRequest.body = {
        email: mockEmail,
        password: mockPassword,
        name: mockName,
        confirmpassword: mockConfirmPassword,
        adminKey: mockAdminKey,
    };

    await expect(userController.signUpAdmin(mockRequest, mockResponse, mockNext)).rejects.toThrow('관리자 등록 권한이 없습니다.');
});

test('signIn', async () => {
    const mockEmail = 'user@test.com';
    const mockPassword = 'password123';
    const mockUser = {
        userId: 1,
        email: mockEmail,
        password: await bcrypt.hash(mockPassword, 10),
    };

    mockUsersRepository.findUserByEmail.mockResolvedValue(mockUser);

    const { token, refreshToken } = await authService.signIn(mockEmail, mockPassword);

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const decodedRefreshToken = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    expect(decodedToken.userId).toBe(mockUser.userId);
    expect(decodedRefreshToken.userId).toBe(mockUser.userId);
    expect(mockUsersRepository.findUserByEmail).toHaveBeenCalledWith(mockEmail);
    expect(mockUsersRepository.findUserByEmail).toHaveBeenCalledTimes(1);
});

test('signIn - should throw error when email does not exist', async () => {
    const mockEmail = 'user@test.com';
    const mockPassword = 'password123';

    mockUsersRepository.findUserByEmail.mockResolvedValue(null);

    await expect(authService.signIn(mockEmail, mockPassword)).rejects.toThrow('존재하지 않는 이메일입니다.');
});

test('signIn - should throw error when password is incorrect', async () => {
    const mockEmail = 'user@test.com';
    const mockPassword = 'password123';
    const incorrectPassword = 'incorrectPassword';
    const mockUser = {
        userId: 1,
        email: mockEmail,
        password: await bcrypt.hash(mockPassword, 10),
    };

    mockUsersRepository.findUserByEmail.mockResolvedValue(mockUser);

    await expect(authService.signIn(mockEmail, incorrectPassword)).rejects.toThrow('비밀번호가 일치하지 않습니다.');
});

test('refreshToken', async () => {
    const mockUserId = 1;
    const mockRefreshToken = jwt.sign({ userId: mockUserId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

    const newToken = await authService.refreshToken(mockRefreshToken);

    const decodedNewToken = jwt.verify(newToken, process.env.JWT_SECRET);

    expect(decodedNewToken.userId).toBe(mockUserId);
});

test('refreshToken - should throw error when no refresh token is provided', async () => {
    await expect(authService.refreshToken(null)).rejects.toThrow('리프레쉬 토큰이 없습니다.');
});

test('refreshToken - should throw error when refresh token is invalid', async () => {
    const invalidRefreshToken = 'invalidRefreshToken';

    await expect(authService.refreshToken(invalidRefreshToken)).rejects.toThrow('리프레쉬 토큰이 유효하지 않습니다.');
});

test('getUser', async () => {
    const mockUserId = 1;
    const mockUser = {
        userId: mockUserId,
        name: 'Test User',
        email: 'test@test.com',
    };

    mockUsersRepository.getUserById.mockResolvedValue(mockUser);

    const user = await usersService.getUser(mockUserId);

    expect(user).toMatchObject(mockUser);
    expect(mockUsersRepository.getUserById).toHaveBeenCalledWith(mockUserId);
    expect(mockUsersRepository.getUserById).toHaveBeenCalledTimes(1);
});

test('updateUser', async () => {
    const mockUserId = 1;
    const mockUpdatedData = { name: 'Updated User', email: 'updated@test.com' };
    const mockUserInfo = { userId: mockUserId, name: 'Test User', email: 'test@test.com', ...mockUpdatedData };

    mockUsersRepository.getUserInfoById.mockResolvedValue(mockUserInfo);
    mockUsersRepository.updateUserInfoAndCreateHistory.mockResolvedValue();

    await usersService.updateUser(mockUserId, mockUpdatedData);

    expect(mockUsersRepository.getUserInfoById).toHaveBeenCalledWith(mockUserId);
    expect(mockUsersRepository.getUserInfoById).toHaveBeenCalledTimes(1);
    expect(mockUsersRepository.updateUserInfoAndCreateHistory).toHaveBeenCalledWith(mockUserId, mockUserInfo, mockUpdatedData);
    expect(mockUsersRepository.updateUserInfoAndCreateHistory).toHaveBeenCalledTimes(1);
});

test('updateUser - should throw error when user does not exist', async () => {
    const mockUserId = 1;
    const mockUpdatedData = { name: 'Updated User', email: 'updated@test.com' };

    mockUsersRepository.getUserInfoById.mockResolvedValue(null);

    await expect(usersService.updateUser(mockUserId, mockUpdatedData)).rejects.toThrow('사용자 정보가 존재하지 않습니다.');
});

})