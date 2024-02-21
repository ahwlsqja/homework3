// import express from 'express'
// import { prisma } from '../utils/prisma/index.js';
// import authMiddleware from '../middlewares/auth.middleware.js';
// import { Prisma } from '@prisma/client';

// const router = express.Router();
// // 1. 게시글을 작성하려는 클라이언트가 로그인된 사용자인지 검증합니다.
// // 2. 게시글 생성을 위한 'title', 'content'를 **body**로 전달 받습니다.
// // 3.**Posts**테이블에 게시글을 생성합니다.

// router.post('/resumes', authMiddleware, async (req, res, next) => {
//     const { title, content } = req.body;
//     const { userId } = req.user;

//     const resume = await prisma.resume.create({
//         data: {
//             userId: +userId,
//             title: title,
//             content: content,
//         }
//     });

//     return res.status(201).json({ data: resume });
// });


// router.get('/resumes', async (req, res, next) => {
//     const { orderKey = 'createdAt', orderValue = 'DESC' } = req.query;
//     const normalizedOrderValue = (orderValue && orderValue.toUpperCase() === 'ASC') ? 'asc' : 'desc';

//     let orderByCondition = {};
//     orderByCondition[orderKey] = normalizedOrderValue;

//     try{
//         const resume = await prisma.resume.findMany({
//             select: {
//                 resumeId: true,
//                 userId: true,
//                 title: true,
//                 content: true,
//                 createdAt: true,
//                 updatedAt: true,
//                 status: true,
//                     user: {
//                         select: {
//                     name: true,
//                     }
//                 }
//             },
//             orderBy: orderByCondition,
//     });

//     return res.status(200).json({ data: resume });
// }catch(error){
//     next(error);
// }
// });


// router.get('/resumes/:resumeId', async(req, res, next) =>{
//     const { resumeId } = req.params;

//     const resume = await prisma.resume.findFirst({
//         where: { resumeId: +resumeId},
//         select: {
//             resumeId: true,
//             title: true,
//             content: true,
//             createdAt: true,
//             updatedAt: true,
//             user: {
//                 select: {
//                     userId: true,
//                     name: true,
//                 }
//             }
//         }
//     })

//     return res.status(200).json({ data: resume });
// });



// router.put('/resumes/:resumeId', authMiddleware, async (req, res, next) => {
//     const updatedData = req.body;
//     const { userId } = req.user;
//     const { resumeId } = req.params;

//     // 이력서 찾기
//     const resume = await prisma.resume.findFirst({
//         where: { resumeId: +resumeId }
//     });

//     if(!resume){
//         return res.status(404).json({ mesage: "이력서 조회에 실패하였습니다." });
//     }

//     if(resume.userId !== userId){
//         return res.status(403).json({ message: "본인이 작성한 이력서만 수정할 수 있습니다."});
//     }

//     await prisma.$transaction(async(tx) => {
//         await tx.resume.update({
//             data: {
//                 ...updatedData
//             },
//             where: {
//                 resumeId: +resumeId,
//             }
//         });

//         for(let key in updatedData){
//             if(resume[key] !== updatedData[key])
//             await tx.userHistories.create({
//         data:{
//             userId: +userId,
//             changedField: key,
//             oldValue: String(resume[key]),
//             newValue: String(updatedData[key]),
//             }
//         });
//     }
//     },{
//         isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted
//     })

//     return res.status(200).json({message: "사용자 정보 변경에 성공했습니다."})
// })


// router.delete('/resumes/:resumeId', authMiddleware, async (req, res, next) => {
//     const { userId } = req.user;
//     const { resumeId } = req.params;

//      // 이력서 찾기
//      const resume = await prisma.resume.findFirst({
//         where: { resumeId: +resumeId }
//     });

//     if(!resume){
//         return res.status(404).json({ mesage: "이력서 조회에 실패하였습니다." });
//     }

//     if(resume.userId !== userId){
//         return res.status(403).json({ message: "본인이 작성한 이력서만 수정할 수 있습니다."});
//     }

//     await prisma.resume.delete({
//         where: { resumeId: +resumeId }
//     })

//     return res.status(200).json({ message: "이력서가 삭제되었습니다. "});
// })


// router.get('/admin-resumes', authMiddleware, async (req, res, next) => {
//     try{
//         const { userId } = req.user;
//         if(req.user.permission !== 'Admin'){
//             return res.status(403).json({ message: '관리자가 아니면 이력서를 열람할 수 없습니다.'})
//         }

//         const resumes = await prisma.resume.findMany();

//         return res.status(200).json(resumes);
//     } catch (err){
//         next(err);
//     }
// })


// router.put('/admin-resumes/:resumeId', authMiddleware, async (req, res, next) => {
//     try{
//         if(req.user.permission !== 'Admin'){
//             return res.status(403).json({ message: '관리자만 이력서를 수정할 수 있습니다.'})
//         }
         
//         const updatedData = req.body;
//         const { resumeId } = req.params;

//         // 이력서 찾기(resumId값을 찾으면 resume에다가 넣어줌)
//         const resume = await prisma.resume.findFirst({
//             where: { resumeId: +resumeId }
//         });


//     if(!resume){
//         return res.status(404).json({ mesage: "이력서 조회에 실패하였습니다." });
//     }

//     await prisma.$transaction(async(tx) => {
//         await tx.resume.update({
//             data: {
//                 ...updatedData
//             },
//             where: {
//                 resumeId: +resumeId,
//             }
//         });

//         for(let key in updatedData){
//             if(resume[key] !== updatedData[key])
//             await tx.userHistories.create({
//         data:{
//             userId: +resume.userId,
//             changedField: key,
//             oldValue: String(resume[key]),
//             newValue: String(updatedData[key]),
//             }
//         });
//     }
//     },{
//         isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted
//     })

//     return res.status(200).json({message: "사용자 정보 변경에 성공했습니다."})
// } catch(err) {
//     next(err);
// }
// })

// router.delete('/admin-resumes/:resumeId', authMiddleware, async (req, res, next) => {
//     try{
//         if(req.user.permission!=='Admin'){
//             return res.status(403).json({ message: '관리자가 아니면 삭제할 수 없습니다.'})
//         }
//     const { resumeId } = req.params;

//      // 이력서 찾기
//      const resume = await prisma.resume.findFirst({
//         where: { resumeId: +resumeId }
//     });

//     if(!resume){
//         return res.status(404).json({ mesage: "이력서 조회에 실패하였습니다." });
//     }

//     await prisma.resume.delete({
//         where: { resumeId: +resumeId }
//     })

//     return res.status(200).json({ message: "이력서가 삭제되었습니다. "});
// } catch(err){
//     next(err)
// }
// })
// export default router;