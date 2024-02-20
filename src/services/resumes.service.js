import { ResumeRepository } from '../repositories/posts.repository'


export class ResumesService {
    resumeRepository = new ResumeRepository();

    // 이력서 전체 조회
    findAllResumes = async(orderKey, orderValue) => {
        // 레포에 데이터 요청
        const resumes = await this.resumeRepository.findAllResumes(orderKey, orderValue);

        // 데이터 가공
        return resumes.map((resume) => {
            return {
                resumeId: resume.resumeId,
                userId: resume.userId,
                title: resume.title,
                status: resume.status,
                name: resume.user.name,
                createdAt: resume.createdAt,
                updatedAt: resume.updatedAt,
            }
        });
    };

    // 이력서 하나 조회 
    findresumeById = async (resumeId) => {
        // 레포에 게시물 하나 요청
        const resume = await this.resumeRepository.findresumeById(resumeId);
        return {
            resumeId: resume.resumeId,
            userId: resume.userId,
            title: resume.title,
            status: resume.status,
            name: resume.user.name,
            createdAt: resume.createdAt,
            updatedAt: resume.updatedAt,
        }
    }

    // 이력서 생성
    createResume = async(userId, title, content) => {
        const createdResume = await this.resumeRepository.createResume(
            userId,
            title,
            content,
        );

        return{
            resumeId: createdResume.resumeId,
            title: createdResume.title,
            userId: createdResume.userId,
            content: createdResume.content,
            createdAt: createdResume.createdAt,
            updatedAt: createdResume.updatedAt,
        }
}

    // 이력서 수정
    updateResume = async (resumeId, userId, updatedData) => {
        const resume = await this.resumeRepository.findresumeById(resumeId);

        if(!resume){
            throw new Error("이력서 조회에 실패하였습니다.");
        }

        if(resume.userId !== userId){
            throw new Error('본인이 작성한 이력서만 수정할 수 있습니다.');
        }

        await this.resumeRepository.updateResume(resumeId, updatedData, userId)
}


    // 이력서 삭제
    deleteResume = async (resumeId) => {
        const resume = await this.resumeRepository.findresumeById(resumeId);
        if(!resume) throw new Error("존재하지 않는 이력서입니다.");
        const resumeInfo = {
            resumeId: createdResume.resumeId,
            title: createdResume.title,
            userId: createdResume.userId,
            content: createdResume.content,
            createdAt: createdResume.createdAt,
            updatedAt: createdResume.updatedAt,
        };

        await this.resumeRepository.deleteResume(resumeId);

        return resumeInfo;
    }

    // 관리자 이력서 조회 
    getAllResumes = async () => {
        return await this.resumeRepository.getAllResumes();
    }




    // 관리자 이력서 수정
    // services/resumeService.js

    updateAdminResume = async (resumeId, updatedData) => {
        const resume = await this.resumeRepository.findresumeById(resumeId);

        if(!resume){
        throw new Error("이력서 조회에 실패하였습니다.");
        }

        await this.resumeRepository.updateResumeWithHistory(resumeId, updatedData, resume);
}


    // 관리자 이력서 삭제

    deleteAdminResume = async (resumeId) => {
        const resume = await this.resumeRepository.findresumeById(resumeId);

        if(!resume) {
            throw new Error('이력서 조회가 실패하였습니다.');
        }

        await this.resumeRepository.deleteAdminResume(resumeId);
    }
}
