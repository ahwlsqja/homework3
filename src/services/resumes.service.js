import { sendTodayData } from "../middlewares/slackBot.js"

export class ResumesService {
    constructor(resumeRepository){
        this.resumeRepository = resumeRepository
    }
    // 이력서 전체 조회
    findAllResumes = async(orderKey, orderValue) => {
        await new Promise((resolve) => setTimeout(resolve, 2000)); 
        // 레포에 데이터 요청
        const resumes = await this.resumeRepository.findAllResumes(orderKey, orderValue);

        // 데이터 가공
        try{
            await sendTodayData();
        } catch(err){
            next(err);
        }

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
        await new Promise((resolve) => setTimeout(resolve, 2000)); 

        const resume = await this.resumeRepository.findresumeById(resumeId);
        try{
            await sendTodayData();
        } catch(err){
            next(err);
        }
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

        await new Promise((resolve) => setTimeout(resolve, 2000)); 

        const createdResume = await this.resumeRepository.createResume(
            userId,
            title,
            content,
        );
        
        try{
            await sendTodayData();
        } catch(err){
            next(err);
        }

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

        await new Promise((resolve) => setTimeout(resolve, 2000)); 

        const resume = await this.resumeRepository.findresumeById(resumeId);

        if(!resume){
            throw new Error("이력서 조회에 실패하였습니다.");
        }

        if(resume.userId !== userId){
            throw new Error('본인이 작성한 이력서만 수정할 수 있습니다.');
        }

        await this.resumeRepository.updateResume(resumeId, updatedData, userId)
        try{
            await sendTodayData();
        } catch(err){
            next(err);
        }
}


    // 이력서 삭제
    deleteResume = async (resumeId) => {

        await new Promise((resolve) => setTimeout(resolve, 2000)); 

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
        try{
            await sendTodayData();
        } catch(err){
            next(err);
        }
        return resumeInfo;
    }   

    // 관리자 이력서 조회 
    getAllResumes = async () => {
        await new Promise((resolve) => setTimeout(resolve, 2000)); 
        try{
            await sendTodayData();
        } catch(err){
            next(err);
        }
        return await this.resumeRepository.getAllResumes();
    }




    // 관리자 이력서 수정
    // services/resumeService.js

    updateAdminResume = async (resumeId, updatedData) => {
        await new Promise((resolve) => setTimeout(resolve, 2000)); 

        const resume = await this.resumeRepository.findresumeById(resumeId);

        if(!resume){
        throw new Error("이력서 조회에 실패하였습니다.");
        }
        
        await this.resumeRepository.updateResumeWithHistory(resumeId, updatedData, resume);
        try{
            await sendTodayData();
        } catch(err){
            next(err);
        }
}


    // 관리자 이력서 삭제

    deleteAdminResume = async (resumeId) => {
        await new Promise((resolve) => setTimeout(resolve, 2000)); 

        const resume = await this.resumeRepository.findresumeById(resumeId);

        if(!resume) {
            throw new Error('이력서 조회가 실패하였습니다.');
        }

        await this.resumeRepository.deleteAdminResume(resumeId);
        try{
            await sendTodayData();
        } catch(err){
            next(err);
        }
    }
}
