import express from 'express'
import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import { Prisma } from '@prisma/client';

const router = express.Router();
// 1. 게시글을 작성하려는 클라이언트가 로그인된 사용자인지 검증합니다.
// 2. 게시글 생성을 위한 'title', 'content'를 **body**로 전달 받습니다.
// 3.**Posts**테이블에 게시글을 생성합니다.


/**
 * @swagger
 * /resumes:
 *   post:
 *     summary: 이력서 생성
 *     tags: [Resumes]
 *     security: 
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 description: 이력서 제목
 *               content:
 *                 type: string
 *                 description: 이력서 내용
 *     responses:
 *       201:
 *         description: 이력서 생성에 성공했습니다.
 *         content: 
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Resume'
 * components:
 *   schemas:
 *     Resume:
 *       type: object
 *       properties:
 *         userId:
 *           type: integer
 *           description: 사용자 ID
 *         title:
 *           type: string
 *           description: 이력서 제목
 *         content:
 *           type: string
 *           description: 이력서 내용
 */
router.post('/resumes', authMiddleware, async (req, res, next) => {
    const { title, content } = req.body;
    const { userId } = req.user;

    const resume = await prisma.resume.create({
        data: {
            userId: +userId,
            title: title,
            content: content,
        }
    });

    return res.status(201).json({ data: resume });
});

// 이력서 전체 조회
/**
 * @swagger
 * /resumes:
 *   get:
 *     summary: 이력서 목록 조회
 *     tags: [Resumes]
 *     responses:
 *       200:
 *         description: 이력서 목록 조회에 성공했습니다.
 *         content: 
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Resume'
 * components:
 *   schemas:
 *     Resume:
 *       type: object
 *       properties:
 *         resumeId:
 *           type: integer
 *           description: 이력서 ID
 *         userId:
 *           type: integer
 *           description: 사용자 ID
 *         title:
 *           type: string
 *           description: 이력서 제목
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 이력서 생성 시각
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 이력서 수정 시각
 *         user:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               description: 사용자 이름
 */
router.get('/resumes', async (req, res, next) => {
    const { orderKey = 'createdAt', orderValue = 'DESC' } = req.query;
    const normalizedOrderValue = (orderValue && orderValue.toUpperCase() === 'ASC') ? 'asc' : 'desc';

    let orderByCondition = {};
    orderByCondition[orderKey] = normalizedOrderValue;

    try{
        const resume = await prisma.resume.findMany({
            select: {
                resumeId: true,
                userId: true,
                title: true,
                content: true,
                createdAt: true,
                updatedAt: true,
                status: true,
                    user: {
                        select: {
                    name: true,
                    }
                }
            },
            orderBy: orderByCondition,
    });

    return res.status(200).json({ data: resume });
}catch(error){
    next(error);
}
});

/**
 * @swagger
 * /resumes/{resumeId}:
 *   get:
 *     summary: 특정 이력서 조회
 *     tags: [Resumes]
 *     parameters:
 *       - in: path
 *         name: resumeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 조회하고자 하는 이력서 ID
 *     responses:
 *       200:
 *         description: 이력서 조회에 성공했습니다.
 *         content: 
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Resume'
 * components:
 *   schemas:
 *     Resume:
 *       type: object
 *       properties:
 *         resumeId:
 *           type: integer
 *           description: 이력서 ID
 *         title:
 *           type: string
 *           description: 이력서 제목
 *         content:
 *           type: string
 *           description: 이력서 내용
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 이력서 생성 시각
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 이력서 수정 시각
 *         user:
 *           type: object
 *           properties:
 *             userId:
 *               type: integer
 *               description: 사용자 ID
 *             name:
 *               type: string
 *               description: 사용자 이름
 */
router.get('/resumes/:resumeId', async(req, res, next) =>{
    const { resumeId } = req.params;

    const resume = await prisma.resume.findFirst({
        where: { resumeId: +resumeId},
        select: {
            resumeId: true,
            title: true,
            content: true,
            createdAt: true,
            updatedAt: true,
            user: {
                select: {
                    userId: true,
                    name: true,
                }
            }
        }
    })

    return res.status(200).json({ data: resume });
});


/**
 * @swagger
 * /resumes/{resumeId}:
 *   put:
 *     summary: 이력서 수정
 *     tags: [Resumes]
 *     security: 
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: resumeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 수정하고자 하는 이력서 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: 변경하고자 하는 이력서 제목
 *               content:
 *                 type: string
 *                 description: 변경하고자 하는 이력서 내용
 *     responses:
 *       200:
 *         description: 이력서 정보 변경에 성공했습니다.
 *       403:
 *         description: 본인이 작성한 이력서만 수정할 수 있습니다.
 *       404:
 *         description: 이력서 조회에 실패하였습니다.
 */
router.put('/resumes/:resumeId', authMiddleware, async (req, res, next) => {
    const updatedData = req.body;
    const { userId } = req.user;
    const { resumeId } = req.params;

    // 이력서 찾기
    const resume = await prisma.resume.findFirst({
        where: { resumeId: +resumeId }
    });

    if(!resume){
        return res.status(404).json({ mesage: "이력서 조회에 실패하였습니다." });
    }

    if(resume.userId !== userId){
        return res.status(403).json({ message: "본인이 작성한 이력서만 수정할 수 있습니다."});
    }

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
    })

    return res.status(200).json({message: "사용자 정보 변경에 성공했습니다."})
})

/**
 * @swagger
 * /resumes/{resumeId}:
 *   delete:
 *     summary: 이력서 삭제
 *     tags: [Resumes]
 *     security: 
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: resumeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 삭제하고자 하는 이력서 ID
 *     responses:
 *       200:
 *         description: 이력서가 삭제되었습니다.
 *       403:
 *         description: 본인이 작성한 이력서만 삭제할 수 있습니다.
 *       404:
 *         description: 이력서 조회에 실패하였습니다.
 */
router.delete('/resumes/:resumeId', authMiddleware, async (req, res, next) => {
    const { userId } = req.user;
    const { resumeId } = req.params;

     // 이력서 찾기
     const resume = await prisma.resume.findFirst({
        where: { resumeId: +resumeId }
    });

    if(!resume){
        return res.status(404).json({ mesage: "이력서 조회에 실패하였습니다." });
    }

    if(resume.userId !== userId){
        return res.status(403).json({ message: "본인이 작성한 이력서만 수정할 수 있습니다."});
    }

    await prisma.resume.delete({
        where: { resumeId: +resumeId }
    })

    return res.status(200).json({ message: "이력서가 삭제되었습니다. "});
})

/**
 * @swagger
 * /admin-resumes:
 *   get:
 *     summary: 관리자용 이력서 전체 조회
 *     tags: [Resumes]
 *     security: 
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 이력서 전체 조회에 성공했습니다.
 *         content: 
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Resume'
 *       403:
 *         description: 관리자가 아니면 이력서를 열람할 수 없습니다.
 * components:
 *   schemas:
 *     Resume:
 *       type: object
 *       properties:
 *         resumeId:
 *           type: integer
 *           description: 이력서 ID
 *         userId:
 *           type: integer
 *           description: 사용자 ID
 *         title:
 *           type: string
 *           description: 이력서 제목
 *         content:
 *           type: string
 *           description: 이력서 내용
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 이력서 생성 시각
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 이력서 수정 시각
 */
router.get('/admin-resumes', authMiddleware, async (req, res, next) => {
    try{
        const { userId } = req.user;
        if(req.user.permission !== 'Admin'){
            return res.status(403).json({ message: '관리자가 아니면 이력서를 열람할 수 없습니다.'})
        }

        const resumes = await prisma.resume.findMany();

        return res.status(200).json(resumes);
    } catch (err){
        next(err);
    }
})

/**
 * @swagger
 * /admin-resumes/{resumeId}:
 *   put:
 *     summary: 관리자용 이력서 수정
 *     tags: [Resumes]
 *     security: 
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: resumeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 수정하고자 하는 이력서 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: 변경하고자 하는 이력서 제목
 *               content:
 *                 type: string
 *                 description: 변경하고자 하는 이력서 내용
 *     responses:
 *       200:
 *         description: 이력서 정보 변경에 성공했습니다.
 *       403:
 *         description: 관리자만 이력서를 수정할 수 있습니다.
 *       404:
 *         description: 이력서 조회에 실패하였습니다.
 */
router.put('/admin-resumes/:resumeId', authMiddleware, async (req, res, next) => {
    try{
        if(req.user.permission !== 'Admin'){
            return res.status(403).json({ message: '관리자만 이력서를 수정할 수 있습니다.'})
        }
         
        const updatedData = req.body;
        const { resumeId } = req.params;

        // 이력서 찾기(resumId값을 찾으면 resume에다가 넣어줌)
        const resume = await prisma.resume.findFirst({
            where: { resumeId: +resumeId }
        });


    if(!resume){
        return res.status(404).json({ mesage: "이력서 조회에 실패하였습니다." });
    }

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
            userId: +resume.userId,
            changedField: key,
            oldValue: String(resume[key]),
            newValue: String(updatedData[key]),
            }
        });
    }
    },{
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted
    })

    return res.status(200).json({message: "사용자 정보 변경에 성공했습니다."})
} catch(err) {
    next(err);
}
})

/**
 * @swagger
 * /admin-resumes/{resumeId}:
 *   delete:
 *     summary: 관리자용 이력서 삭제
 *     tags: [Resumes]
 *     security: 
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: resumeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 삭제하고자 하는 이력서 ID
 *     responses:
 *       200:
 *         description: 이력서가 삭제되었습니다.
 *       403:
 *         description: 관리자가 아니면 삭제할 수 없습니다.
 *       404:
 *         description: 이력서 조회에 실패하였습니다.
 */
router.delete('/admin-resumes/:resumeId', authMiddleware, async (req, res, next) => {
    try{
        if(req.user.permission!=='Admin'){
            return res.status(403).json({ message: '관리자가 아니면 삭제할 수 없습니다.'})
        }
    const { resumeId } = req.params;

     // 이력서 찾기
     const resume = await prisma.resume.findFirst({
        where: { resumeId: +resumeId }
    });

    if(!resume){
        return res.status(404).json({ mesage: "이력서 조회에 실패하였습니다." });
    }

    await prisma.resume.delete({
        where: { resumeId: +resumeId }
    })

    return res.status(200).json({ message: "이력서가 삭제되었습니다. "});
} catch(err){
    next(err)
}
})
export default router;