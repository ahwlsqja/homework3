import  { emailVerificationMiddleware } from "../middlewares/emailVerification.middleware.js";
import { tokenKey } from "../redis/keys.js";
import { Prisma } from '@prisma/client';

export class UsersRepository {
    constructor(prisma, redisClient){
        this.prisma = prisma;
        this.redisClient = redisClient;
    }
    findUserByEmail  = async (email) => {
        return await this.prisma.users.findFirst({
            where: { email: email }
        });
    };
        createUser = async (email, hashedPassword, name) => {
        const token = Math.floor(Math.random() * 900000) + 100000;
        const [user, userInfo] = await this.prisma.$transaction(async(tx) => {
            const user = await tx.users.create({
                data: {
                    email, 
                    password: hashedPassword,
                    name,
                    verifiedstatus: "nonpass",
                    emailTokens: token.toString(),
                }
            });
            const userInfo = await tx.userInfos.create({
                data: {
                    userId: user.userId,
                    name,
                }
            });
            await emailVerificationMiddleware(email, token);
            return [user, userInfo];
        },{
            isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted
        });
    }


    updateUserVerificationStatus = async (userId) => {
        await this.prisma.users.update({
            where: { userId: userId },
            data: { verifiedstatus: "pass" },
        });
    }

    createAdmin = async (email, hashedPassword, name) => {
        await this.prisma.$transaction(async(tx) => {
            const user = await tx.users.create({
                data: {
                    email,
                    name,
                    password: hashedPassword,
                    permission: 'Admin',
                }
            });
            await tx.userInfos.create({
                data: {
                    userId: user.userId,
                    name,
                }
            });
        },{
            isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted
        });
    }


    getUserById = async (userId) => {
        return await this.prisma.users.findFirst({
            where: { userId: +userId },
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
    };

    getUserInfoById  = async (userId) => {
        return await this.prisma.userInfos.findFirst({
            where: { userId: +userId }
        });
    }
    
    updateUserInfoAndCreateHistory = async (userId, userInfo, updatedData) => {
        await this.prisma.$transaction(async(tx) => {
            await tx.userInfos.update({
                data: { ...updatedData },
                where: { userId: +userId },
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
        }, {
            isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted
        });
    };

    saveToken = async (userId, refreshToken) => {
        return this.redisClient.hSet(tokenKey(userId), "token", refreshToken);
    };

    getToken = async (userId) => {
        return new Promise((resolve, reject) => {
            this.redisClient.hGet(tokenKey(userId), "token", (err, data) => {
                if (err){
                    reject(err);
                } else{
                    resolve(data);
                }
            })
        })
    }

}