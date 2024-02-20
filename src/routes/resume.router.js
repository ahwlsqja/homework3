import express from 'express';
import { ResumesController } from '../controllers/resumes.controller.js';

const router = express.Router();
const ResumesController = new ResumesController(); //ResumesController를 인스턴스화 시킴


// 이력서 조회 api
router.get('/', ResumesController.getResumes);

// 이력서 상세 조회 API 
router.get('/:resumeId', ResumesController.getResumesById);

// 이력서 작성 API 
router.post('/', ResumesController.createResume);

// 이력서 수정 API
router.put('/:resumeId', ResumesController.updateResume);

// 이력서 삭제 API
router.delete('/:resumeId', ResumesController.deleteResume);

// 관리자 이력서 조회 API
router.get('/', ResumesController.getAllResumes);

//관리자 이력서 수정 API
router.put('/:resumeId', ResumesController.deleteAdminResume);

// 관리자 이력서 삭제 API
router.delete('/:resumeId', ResumesController.deleteAdminResume);

export default router;
 





