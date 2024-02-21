// __tests__/unit/posts.controller.unit.spec.js

import { expect, jest, test } from '@jest/globals';
import { ResumesController } from '../../../src/controllers/resumes.controller.js';

// posts.service.js 에서는 아래 5개의 Method만을 사용합니다.
const mockResumesService = {
  findAllResumes: jest.fn(),
  findresumeById: jest.fn(),
  createResume: jest.fn(),
  updateResume: jest.fn(),
  deleteResume: jest.fn(),
  getAllResumes: jest.fn(),
  updateAdminResume: jest.fn(),
  deleteAdminResume: jest.fn()
};

const mockRequest = {
  body: jest.fn(),
};

const mockResponse = {
  status: jest.fn(),
  json: jest.fn(),
};

const mockNext = jest.fn();

// postsController의 Service를 Mock Service로 의존성을 주입합니다.
const resumesController = new ResumesController(mockResumesService);

describe('Resumes Controller Unit Test', () => {
  // 각 test가 실행되기 전에 실행됩니다.
  beforeEach(() => {
    jest.resetAllMocks(); // 모든 Mock을 초기화합니다.

    // mockResponse.status의 경우 메서드 체이닝으로 인해 반환값이 Response(자신: this)로 설정되어야합니다.
    mockResponse.status.mockReturnValue(mockResponse);
  });
  // 게시글 조회 API
  test('getResumes Method', async () => {
    // PostsService의 findAllPosts Method를 실행했을 때 Return 값을 변수로 선언합니다.
    const mockResumes  = [
      {
        resumeId: 1,
        userId: 1,
        title: 'resume1',
        status: 'APPLY',
        user: { name: 'user1'},
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        resumeId: 2,
        userId: 2,
        title: 'resume2',
        status: 'APPLY',
        user: { name: 'user2'},
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockResumesService.findAllResumes.mockResolvedValue(mockResumes);

    // PostsController의 getPosts Method를 실행합니다.
    await resumesController.getResumes(mockRequest, mockResponse, mockNext);
    expect(mockResumesService.findAllResumes).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({ data: mockResumes });
  });
    // 특정 게시글 조회 API
    test('getResumesById Method', async () => {
    // PostsController의 createPost Method가 실행되기 위한 Body 입력 인자들입니다.
    const mockResumeId = 1;
    const mockResume = {
        resumeId: mockResumeId,
        userId: 1,
        title: 'resume1',
        status: 'APPLY',
        user: { name: 'user1'},
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    mockResumesService.findresumeById.mockResolvedValue(mockResume);

    mockRequest.params = { resumeId: mockResumeId };
    await resumesController.getResumesById(mockRequest, mockResponse, mockNext);
    expect(mockResumesService.findresumeById).toHaveBeenCalledTimes(1);
    expect(mockResumesService.findresumeById).toHaveBeenCalledWith(mockResumeId);
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({ data: mockResume });
    });
    // 게시글 생성 API
    test('createResume Method', async () => {
        const mockTitle = 'Resume Title';
        const mockContent = 'This is a resume';
        const mockUserId = 1;
        const mockCreatedResume = {
            resumeId: 1,
            userId : mockUserId,
            title: mockTitle,
            content: mockContent,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        mockResumesService.createResume.mockResolvedValue(mockCreatedResume);

        mockRequest.body = {
            title: mockTitle,
            content: mockContent,
        }

        await resumesController.createResume(mockRequest, mockResponse, mockNext)

        expect(mockResumesService.createResume).toHaveBeenCalledTimes(1);
        expect(mockResumesService.createResume).toHaveBeenCalledWith(mockUserId, mockTitle, mockContent);
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith({ data: mockCreatedResume })
    });

    // 게시물 수정 API
    test('updateResume Method', async() => {
        const mockUserId = 1;
        const mockResumeId = 1;
        const mockUpdatedData = {
            title: 'Updated resume',
            content: 'This is an updated resume.',
        };

        mockResumesService.updateResume.mockResolvedValue();

        mockRequest.body = mockUpdatedData;
        mockRequest.params = { resumeId : mockResumeId };
        mockRequest.user = { userId: mockUserId };
        await resumesController.updateResume(mockRequest, mockResponse, mockNext);

        expect(mockResumesService.updateResume).toHaveBeenCalledTimes(1);
        expect(mockResumesService.updateResume).toHaveBeenCalledWith(mockResumeId, mockUserId, mockUpdatedData);
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: "사용자 정보 변경에 성공했습니다." });
    });

    // 이력서 삭제 API
    test('deleteResume Method',  async() => {
        const mockResumeId = 1;
        const mockDeletedResume = {
            resumeId: mockResumeId,
            userId: 1,
            content: 'This is a resume.',
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        mockResumesService.deleteResume.mockResolvedValue(mockDeletedResume);

        mockRequest.params = { resumeId: mockResumeId };
        await resumesController.deleteResume(mockRequest, mockResponse, mockNext);
        expect(mockResumesService.deleteResume).toHaveBeenCalledTimes(1);
        expect(mockResumesService.deleteResume).toHaveBeenCalledWith(mockResumeId);
        expect(mockResponse.status).toHaveBeenCalled(200);
        expect(mockResponse.json).toHaveBeenCalledWith({ data: mockDeletedResume });
    })

    // 관리자 이력서 조회 API
    test('getAllResumes Method - Admin', async() => {
        const mockUserId = 1;
        const mockPermission = 'Admin';
        const mockResumes = [{
            resumeId: 1,
            userId : 1,
            title : 'Resume1',
            content: 'This is a resume',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            resumeId: 2,
            userId: 2,
            title: "Resume2",
            content: "this is new resume",
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ];
    mockResumesService.getAllResumes.mockResolvedValue(mockResumes);
    mockRequest.user = {
        userId: mockUserId,
        permission: mockPermission,
    };

    await resumesController.getAllResumes(mockRequest, mockResponse, mockNext);

    expect(mockResumesService.getAllResumes).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({ data: mockResumes });
    })

    // 관리자 이력서 수정 API 
    test('getAllResumes Method - Not Admin', async () => {
        const mockUserId = 1;
        const mockPermission = 'User';
        mockRequest.user = {
            userId: mockUserId,
            permission: mockPermission,
        }

        await resumesController.getAllResumes(mockRequest, mockResponse, mockNext);
        expect(mockResponse.status).toHaveBeenCalledWith(403);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: "관리자가 아니면 이력서를 열람할 수 없습니다."});
    })

    test('deleteAdminResume Method - Admin', async() => {
        const mockPermission = 'Admin';
        const mockResumeId = 1;
        mockRequest.user = {
            permission: mockPermission,
        };
        mockRequest.params = { resumeId: mockResumeId };

        mockResumesService.deleteAdminResume.mockResolvedValue();
        await resumesController.deleteAdminResume(mockRequest, mockResponse, mockNext);
        expect(mockResumesService.deleteAdminResume).toHaveBeenCalledTimes(1);
        expect(mockResumesService.deleteAdminResume).toHaveBeenCalledWith(mockResumeId);
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: "이력서가 삭제되었습니다."});
    })

    test('deleteAdminResume Method - Not Admin', async() => {
        const mockPermission = 'User';
        mockRequest.user = {
            permission: mockPermission,
        }
        await resumesController.deleteAdminResume(mockRequest,mockResponse, mockNext)
        expect(mockResponse.status).toHaveBeenCalledWith(403);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: "관리자가 아니면 삭제할 수 없습니다."})
    })
  });

