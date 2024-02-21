// __tests__/unit/posts.service.unit.spec.js

import { expect, jest, test } from '@jest/globals';
import { ResumesService } from '../../../src/services/resumes.service.js';

// PostsRepository는 아래의 5개 메서드만 지원하고 있습니다.
let mockResumeRepository = {
  findAllResumes: jest.fn(),
  findresumeById: jest.fn(),
  createResume: jest.fn(),
  updateResume: jest.fn(),
  deleteResume: jest.fn(),
  getAllResumes: jest.fn(),
  updateResumeWithHistory: jest.fn(),
  deleteAdminResume: jest.fn()
};

// postsService의 Repository를 Mock Repository로 의존성을 주입합니다.
let resumesService = new ResumesService(mockResumeRepository);

describe('ResumesService Unit Test', () => {
  // 각 test가 실행되기 전에 실행됩니다.
  beforeEach(() => {
    jest.resetAllMocks(); // 모든 Mock을 초기화합니다.
  })

  test('findAllResumes Method', async () => {
    const mockResumes = [
      {
        resumeId: 1,
        userId: 2,
        title: 'title',
        status: 'status',
        user: { name: 'name' },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const mockOrderKey = 'title';
    const mockOrderValue = 'ASC';

    mockResumeRepository.findAllResumes.mockResolvedValue(mockResumes);

    const resumes = await resumesService.findAllResumes(mockOrderKey, mockOrderValue);

    expect(resumes).toEqual(mockResumes);
    expect(mockResumeRepository.findAllResumes).toHaveBeenCalledWith({[mockOrderKey]: mockOrderValue});
  });

test('findResumeById Method', async () => {
    const resumeId = 1;
    const mockReturn = {
        resumeId: 1,
        userId: 1,
        title: 'resume1',
        status: 'APPLY',
        user: { name: 'user1' },
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    mockResumeRepository.findresumeById.mockResolvedValue(mockReturn);

    const resume = await resumesService.findresumeById(resumeId);
    expect(resume).toHaveProperty('name', mockReturn.user.name);
    expect(mockResumeRepository.findresumeById).toHaveBeenCalledTimes(1);
    expect(mockResumeRepository.findresumeById).toHaveBeenCalledWith(resumeId);

})

test('createResume Method', async () => {
    const userId = 1;
    const title = 'New Resume';
    const content = 'This is a new resume';
    const mockReturn = {
        resumeId: 1,
        userId: userId,
        title: title,
        content: content,
        createdAt: new Date(),
        updatedAt : new Date(),
    };

    mockResumeRepository.createResume.mockResolvedValue(mockReturn);
    const createdResume = await resumesService.createResume(userId, title, content);

    expect(createdResume).toHaveProperty('title',title);
    expect(createdResume).toHaveProperty('content',content);
    expect(mockResumeRepository.createResume).toHaveBeenCalledWith(userId, title, content);

})
test('updateResume Method', async() => {
    const resumeId = 1;
    const userId = 1;
    const updatedData = {
        title: "Updated Resume",
        content: "This is an updated resume.",
    }
    const mockResume = {
        resumeId: resumeId,
        userId: userId,
        title: 'Original Resume',
        content: 'This is the original resume.'
    }
    mockResumeRepository.findresumeById.mockResolvedValue(mockResume);
    mockResumeRepository.updateResume.mockResolvedValue();

    expect(mockResumeRepository.updateResume).toHaveBeenCalledTimes(1);
    expect(mockResumeRepository.updateResume).toHaveBeenCalledWith(resumeId, updatedData, userId);
});


test('deletePost Method ', async () => {
    const resumeId = 1;
    const mockResume = {
        resumeId: 1,
        userId: 1,
        title: 'Resume',
        content: 'This is a resume',
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    mockResumeRepository.findresumeById.mockResolvedValue(mockResume);
    mockResumeRepository.deleteResume.mockResolvedValue();

    const deletedResume = await resumesService.deleteResume(resumeId);

    // 가공된 데이터의 형태를 검증합니다.
    expect(deletedResume).toHaveProperty('title', mockResume.title);
    expect(mockResumeRepository.findresumeById).toHaveBeenCalledTimes(1);
    expect(mockResumeRepository.findresumeById).toHaveBeenCalledWith(resumeId);
    expect(mockResumeRepository.deleteResume).toHaveBeenCalledTimes(1);
    expect(mockResumeRepository.deleteResume).toHaveBeenCalledWith(resumeId);
  });

  test('getAllResumes Method', async () => {
    // TODO: 여기에 코드를 작성해야합니다.
    const mockReturn = [
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
        }
    ];
    mockResumeRepository.getAllResumes.mockResolvedValue(mockReturn);

    const resumes = await resumesService.getAllResumes();

    expect(resumes.length).toBe(mockReturn.length);
    expect(mockResumeRepository.getAllResumes).toHaveBeenCalledTimes(1)
  });

  test('updateAdminResume Method', async() => {
    const resumdId = 1;
    const updatedData = {
        title: 'Updated Resume',
        content: 'This is an updated resume',
    }
    const mockResume = {
        resumdId: resumdId,
        userId: 1,
        title: 'Original Resume',
        content: 'This is the original resume',
    };
    mockResumeRepository.findresumeById.mockResolvedValue(mockResume);
    mockResumeRepository.updateResumeWithHistory.mockResolvedValue();
    await resumesService.updateAdminResume(resumdId, updatedData);

    expect(mockResumeRepository.updateResumeWithHistory).toHaveBeenCalledTimes(1);
    expect(mockResumeRepository.updateResumeWithHistory).toHaveBeenCalledWith(resumdId, updatedData, mockResume)
  })

  test('deleteAdminResume Method', async() => {
    const resumdId = 1;
    const mockResume = {
        resumdId: 1,
        userId: 1,
        title: 'Resume',
        content:'This is a resume.',
        createdAt: new Date(),
        updatedAt: new Date(),
    }
    mockResumeRepository.findresumeById.mockResolvedValue(mockResume);
    mockResumeRepository.deleteAdminResume.mockResolvedValue();
    await resumesService.deleteAdminResume(resumdId);
    expect(mockResumeRepository.findresumeById).toHaveBeenCalledTimes(1);
    expect(mockResumeRepository.findresumeById).toHaveBeenCalledWith(resumdId);
    expect(mockResumeRepository.deleteAdminResume).toHaveBeenCalledTimes(1);
    expect(mockResumeRepository.deleteAdminResume).toHaveBeenCalledWith(resumdId);
  })
}); 
