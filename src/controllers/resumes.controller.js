
export class ResumesController {
    constructor(resumesService){
        this.resumesService = resumesService; 
    }
    // 게시글 조회 API
    getResumes = async (req, res, next) => {
        try{
            const resumes = await this.resumesService.findAllResumes(); // 멤버 변수에 들어있는 변수를 사용해야 하기 땜시 this 씀

            return res.status(200).json({ data: resumes });
        }catch(err){
            next(err);
        }

    };

    // 특정 게시글 조회 API
    getResumesById = async (req, res, next) => {
        try{
            const { resumeId } = req.params;
        const resume = await this.resumesService.findresumeById(resumeId);
        return res.status(200).json({ data: resume });
        
        }catch(err){
            next(err);
        }
    };

    // 게시글 생성 API
    createResume = async(req,res,next) => {
        try{
            const { title, content } = req.body;

            const createdResume = await this.resumesService.createResume(
                userId,
                title, 
                content,
        );
            return res.status(201).json({ data: createdResume });
        }catch(err){
            next(err);
        }
    };

    // 게시물 수정 API

    updateResume = async (req, res, next) => {
    try {
        const updatedData = req.body;
        const { userId } = req.user;
        const { resumeId } = req.params;

        await ResumesService.updateResume(resumeId, userId, updatedData);

        return res.status(200).json({message: "사용자 정보 변경에 성공했습니다."});
    } catch (err) {
        next(err);
    }
}
    // 이력서 삭제 API
    deleteResume = async (req, res, next) => {
        try{
            const { resumeId } = req.params;


            // 서비스 계층에 구현된 deletePost 로직을 실행함
            const deletedResume = await this.resumesService.deleteResume(resumeId);

            return res.status(200).json({ data: deletedResume });
        } catch(err)
        {
            next(err);
        }
    };


    // 관리자 이력서 조회 API
    getAllResumes = async (req, res, next) => {
        try {
            const { userId, permission } = req.user;

            if(permission !== 'Admin'){
                return res.status(403).json({ message: "관리자가 아니면 이력서를 열람할 수 없습니다."})
            }

            const resumes = await this.resumesService.getAllResumes();

            return res.status(200).json({ data: resumes });
        } catch(err){
            next(err)
        }
    }


    // 관리자 이력서 수정 API 
    deleteAdminResume = async (req, res, next) => {
        try {
            const { permission } = req.user;
            const { resumeId } = req.params;
            const updatedData = req.body;
    
            if(permission !== 'Admin'){
                return res.status(403).json({ message: '관리자만 이력서를 수정할 수 있습니다.'})
            }
    
            await this.resumesService.updateAdminResume(resumeId, updatedData);
    
            return res.status(200).json({ message: "사용자 정보 변경에 성공했습니다."});
        } catch (err) {
            next(err);
        }
    }

    // 관리자 이력서 삭제 API
    deleteAdminResume = async (req, res, next) => {
        try {
            const { permission } = req.user;
            const { resumeId } = req.params;

            if(permission !== 'Admin'){
                return res.status(403).json({ message: "관리자가 아니면 삭제할 수 없습니다."});
            }

            await this.resumesService.deleteAdminResume(resumeId);

            return res.status(200).json({ message: "이력서가 삭제되었습니다."});
        } catch(err) {
            next(err);
        }
    }
}