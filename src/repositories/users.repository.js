import { prisma } from "../utils/prisma/index.js";
import { emailVerificationMiddleware } from "../middlewares/emailVerification.middleware";
import { Prisma } from '@prisma/client';

export class UsersRepository {
    findUserByEmail  = async (email) => {
        return await prisma.users.findFirst({
            where: { email: email }
        });
    };
        createUser = async (email, hashedPassword, name) => {
        const token = Math.floor(Math.random() * 900000) + 100000;
        const [user, userInfo] = await prisma.$transaction(async(tx) => {
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
        await prisma.users.update({
            where: { userId: userId },
            data: { verifiedstatus: "pass" },
        });
    }

    createAdmin = async (email, hashedPassword, name) => {
        await prisma.$transaction(async(tx) => {
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
        return await prisma.users.findFirst({
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
        return await prisma.userInfos.findFirst({
            where: { userId: +userId }
        });
    }
    updateUserInfoAndCreateHistory = async (userId, userInfo, updatedData) => {
        await prisma.$transaction(async(tx) => {
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
}