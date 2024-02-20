import { prisma } from "../utils/prisma/index.js";
import { Prisma } from '@prisma/client';

export class ResumeRepository {
    findAllResumes = async(orderKey = 'createdAt', orderValue='desc') => {
        // ORM인 Prisma에서 Posts 모델의 findMany 메서드를 사용해 데이터를 요청합니다.
        let orderByCondition = {};
        orderByCondition[orderKey] = orderValue;
        const resumes = await prisma.resume.findMany({
            include :{
                user: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: orderByCondition,
        });

        return resumes;
    }; // 이렇게 모든 게시물 목록만 가져오면 된다.


    findresumeById = async (resumeId) => {
        // ORM인 Prisma에서 Posts 모델의 findUnique 메서드를 사용해 데이터 요청합니다.
        const resumes = await prisma.resume.findUnique({
            where: { resumeId: +resumeId },
            include: {
                user: true,
            }
        });

        return resumes;
    };

    createResume = async(userId, title, content ) => {
        // ORM인 Prisma에서 Posts 모델의 create 메서드를 사용해 데이터르 요청합니다.
        const createdResume = await prisma.resume.create({
            data: {
                userId: +userId,
                title, 
                content,
            }
        });

        return createdResume
    };

    updateResume = async (resumeId, updatedData, userId) => {
        await prisma.$transaction(async(tx) => {
            await tx.resume.update({
                data: {
                    ...updatedData
                },
                where: {
                    resumeId: +resumeId,
                }
            });
    
            for(let key in updatedData){
                if(resume[key] !== updatedData[key])
                await tx.userHistories.create({
                    data:{
                        userId: +userId,
                        changedField: key,
                        oldValue: String(resume[key]),
                        newValue: String(updatedData[key]),
                    }
                });
            }
        },{
            isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted
        });
    };
    // 일반 이력서 삭제
    deleteResume = async (resumeId) => {
        // ORM인 Prisma에서 posts 모델의 delete 메서드를 사용해 데이터를 삭제합니다.
        const deletedResume = await prisma.resume.delete({
            where: {
                resumeId: +resumeId,
            },
        });

        return deletedResume;
    };



    // 관리자 이력서 조회
    getAllResumes = async() => {
        return await prisma.resume.findMany();
    }


    // 관리자 이력서 수정
    
    // repositories/resumeRepo.js
    updateResumeWithHistory = async (resumeId, updatedData, oldResume) => {
    await prisma.$transaction(async(tx) => {
        await tx.resume.update({
            data: {
                ...updatedData
            },
            where: {
                resumeId: +resumeId,
            }
        });

        for(let key in updatedData){
            if(oldResume[key] !== updatedData[key])
            await tx.userHistories.create({
                data:{
                    userId: +oldResume.userId,
                    changedField: key,
                    oldValue: String(oldResume[key]),
                    newValue: String(updatedData[key]),
                }
            });
        }
    },{
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted
    });
};

    // 관리자 이력서 삭제 
    deleteAdminResume = async (resumeId) => {
        await prisma.resume.delete({
            where: { resumeId: +resumeId }
        });
    };

}

