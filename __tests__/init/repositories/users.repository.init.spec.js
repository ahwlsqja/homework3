import { expect, jest, test } from '@jest/globals';
import { UsersRepository } from '../../../src/repositories/users.repository.js';

// Prisma 클라이언트에서는 아래 5개의 메서드만 사용합니다.
let mockPrisma = {
    resume: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

let usersRepository = new UsersRepository(mockPrisma);

describe('users Repository Unit Test', () => {

  // 각 test가 실행되기 전에 실행됩니다.
  beforeEach(() => {
    jest.resetAllMocks(); // 모든 Mock을 초기화합니다.
  })

  // 이메일로 유저 찾기

  test('findUserByEmail Method', async () => {
    const mockEmail ='test@test.com';
    const mockUser = {
        userId:1,
        email: mockEmail,
        password: 'password',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    mockPrisma.users.findFirst.mockResolvedValue(mockUser);
    const result = await usersRepository.findUserByEmail(mockEmail);
    expect(mockPrisma.users.findFirst).toHaveBeenCalledTimes(1);
    expect(mockPrisma.users.findFirst).toHaveBeenCalledWith({ where: { email: mockEmail } });
    expect(result).toEqual(mockUser);
  })

  // 특정 이력서 조회

  test('createUser Method', async() => {
    const mockEmail = 'test@test.com';
    const mockHashedPassword = 'hashedPassword';
    const mockName = 'Test User';
    const mockToken = '123456';
    const mockUser = {
        userId: 1,
        email: mockEmail,
        password: mockHashedPassword,
        name: mockName,
        verifiedstatus: "nonpass",
        emailTokens: mockToken,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    const mockUserInfo = {
        userInfoId: 1,
        userId: 1,
        name: mockName,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    Math.random = jest.fn(() => 0.123456); // Mock Math.random to return a predictable value
    mockPrisma.$transaction.mockResolvedValue([mockUser, mockUserInfo]);

    // createUser 메서드 호출
    await usersRepository.createUser(mockEmail, mockHashedPassword, mockName);

    // 결과 검증
    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
    // Check the input to the transaction function
    const transactionInput = mockPrisma.$transaction.mock.calls[0][0];
    const [createdUser, createdUserInfo] = await transactionInput({ users: mockPrisma.users, userInfos: mockPrisma.userInfos });
    expect(createdUser).toEqual(mockUser);
    expect(createdUserInfo).toEqual(mockUserInfo);
    })


    test('updateUserVerificationStatus Method', async () => {
        // mock 데이터 설정
        const mockUserId = 1;
    
        mockPrisma.users.update.mockResolvedValue();
    
        // updateUserVerificationStatus 메서드 호출
        await usersRepository.updateUserVerificationStatus(mockUserId);
    
        // 결과 검증
        expect(mockPrisma.users.update).toHaveBeenCalledTimes(1);
        expect(mockPrisma.users.update).toHaveBeenCalledWith({
            where: { userId: mockUserId },
            data: { verifiedstatus: "pass" },
        });
    });

    test('createAdmin Method', async () => {
        // mock 데이터 설정
        const mockEmail = 'admin@test.com';
        const mockHashedPassword = 'hashedPassword';
        const mockName = 'Admin User';
        const mockUser = {
            userId: 1,
            email: mockEmail,
            password: mockHashedPassword,
            name: mockName,
            permission: 'Admin',
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const mockUserInfo = {
            userInfoId: 1,
            userId: 1,
            name: mockName,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    
        mockPrisma.$transaction.mockResolvedValue();
    
        // createAdmin 메서드 호출
        await usersRepository.createAdmin(mockEmail, mockHashedPassword, mockName);
    
        // 결과 검증
        expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
        // Check the input to the transaction function
        const transactionInput = mockPrisma.$transaction.mock.calls[0][0];
        const transactionResult = await transactionInput({ users: mockPrisma.users, userInfos: mockPrisma.userInfos });
        expect(mockPrisma.users.create).toHaveBeenCalledWith({
            data: {
                email: mockEmail,
                name: mockName,
                password: mockHashedPassword,
                permission: 'Admin',
            }
        });
        expect(mockPrisma.userInfos.create).toHaveBeenCalledWith({
            data: {
                userId: mockUser.userId,
                name: mockName,
            }
        });
    });
    
    test('getUserById Method', async () => {
        // mock 데이터 설정
        const mockUserId = 1;
        const mockUser = {
            userId: mockUserId,
            email: 'test@test.com',
            createdAt: new Date(),
            updatedAt: new Date(),
            userInfos: {
                name: 'Test User',
            },
        };
    
        mockPrisma.users.findFirst.mockResolvedValue(mockUser);
    
        // getUserById 메서드 호출
        const result = await usersRepository.getUserById(mockUserId);
    
        // 결과 검증
        expect(mockPrisma.users.findFirst).toHaveBeenCalledTimes(1);
        expect(mockPrisma.users.findFirst).toHaveBeenCalledWith({
            where: { userId: +mockUserId },
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
        expect(result).toEqual(mockUser);
    });
    
    test('getUserInfoById Method', async () => {
        // mock 데이터 설정
        const mockUserId = 1;
        const mockUserInfo = {
            userInfoId: 1,
            userId: mockUserId,
            name: 'Test User',
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    
        mockPrisma.userInfos.findFirst.mockResolvedValue(mockUserInfo);
    
        // getUserInfoById 메서드 호출
        const result = await usersRepository.getUserInfoById(mockUserId);
    
        // 결과 검증
        expect(mockPrisma.userInfos.findFirst).toHaveBeenCalledTimes(1);
        expect(mockPrisma.userInfos.findFirst).toHaveBeenCalledWith({
            where: { userId: +mockUserId }
        });
        expect(result).toEqual(mockUserInfo);
    });
    
    test('updateUserInfoAndCreateHistory Method', async () => {
        // mock 데이터 설정
        const mockUserId = 1;
        const mockUserInfo = {
            userInfoId: 1,
            userId: mockUserId,
            name: 'Test User',
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const mockUpdatedData = {
            name: 'Updated User',
        };
    
        mockPrisma.$transaction.mockResolvedValue();
    
        // updateUserInfoAndCreateHistory 메서드 호출
        await usersRepository.updateUserInfoAndCreateHistory(mockUserId, mockUserInfo, mockUpdatedData);
    
        // 결과 검증
        expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
        // Check the input to the transaction function
        const transactionInput = mockPrisma.$transaction.mock.calls[0][0];
        await transactionInput({ userInfos: mockPrisma.userInfos, userHistories: mockPrisma.userHistories });
        expect(mockPrisma.userInfos.update).toHaveBeenCalledWith({
            data: { ...mockUpdatedData },
            where: { userId: +mockUserId },
        });
        expect(mockPrisma.userHistories.create).toHaveBeenCalledWith({
            data: {
                userId: +mockUserId,
                changedField: 'name',
                oldValue: String(mockUserInfo.name),
                newValue: String(mockUpdatedData.name),
            }
        });
    });
    

  })

 