import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import { ResumesController } from '../controllers/resumes.controller.js';
import { ResumesService } from '../services/resumes.service.js';
import { ResumeRepository } from '../repositories/posts.repository.js';

const router = express.Router();


// ResumeRepository의 인스턴스를 생성합니다.
const resumeRepository = new ResumeRepository(prisma);
const resumeService = new ResumesService(resumeRepository);
// ResumesController의 인스턴스를 생성합니다.
const resumesController = new ResumesController(resumeService); //ResumesController를 인스턴스화 시킴


// 이력서 조회 api
router.get('/', resumesController.getResumes);

// 이력서 상세 조회 API 
router.get('/:resumeId', resumesController.getResumesById);

// 이력서 작성 API 
router.post('/', resumesController.createResume);

// 이력서 수정 API
router.put('/:resumeId', resumesController.updateResume);

// 이력서 삭제 API
router.delete('/:resumeId', resumesController.deleteResume);

// 관리자 이력서 조회 API
router.get('/', resumesController.getAllResumes);

//관리자 이력서 수정 API
router.put('/:resumeId', resumesController.deleteAdminResume);

// 관리자 이력서 삭제 API
router.delete('/:resumeId', resumesController.deleteAdminResume);

export default router;
 





