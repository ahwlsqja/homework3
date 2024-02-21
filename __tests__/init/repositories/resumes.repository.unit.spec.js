// __tests__/unit/posts.repository.unit.spec.js

import { expect, jest, test } from '@jest/globals';
import { ResumeRepository } from '../../../src/repositories/posts.repository';

// Prisma 클라이언트에서는 아래 5개의 메서드만 사용합니다.
let mockPrisma = {
    resume: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

let resumeRepository = new ResumeRepository(mockPrisma);

describe('resume Repository Unit Test', () => {

  // 각 test가 실행되기 전에 실행됩니다.
  beforeEach(() => {
    jest.resetAllMocks(); // 모든 Mock을 초기화합니다.
  })

  // 이력서 전체 조회

  test('findAllresumes Method', async () => {
    // TODO: 여기에 코드를 작성해야합니다.
    const mockReturn = 'findMany String';
    mockPrisma.resume.findMany.mockReturnValue(mockReturn);


    const orderKey = 'createdAt';
    const orderValue = 'desc';
    const resumes = await resumeRepository.findAllResumes(orderKey, orderValue);
    // findMany 함수의 반환값은 findAllPosts의 반환값과 같다.
    expect(resumes).toBe(mockReturn);

    // findMany 함수는 최종적으로 1번만 호출된다.
    expect(resumeRepository.prisma.resume.findMany).toHaveBeenCalledTimes(1);
  });

  // 특정 이력서 조회

  test('findResumeById Method', async() => {
    const mockReturn = 'findUnique String';
    mockPrisma.resume.findUnique.mockReturnValue(mockReturn);

    const resumeId = 1;
    const resume = await resumeRepository.findresumeById(resumeId);

    // findUnique의 함수의 반환값은 findResumeById 반환값과 같다.
    expect(resume).toBe(mockReturn);

    // 1번만 실행 검사
    expect(resumeRepository.prisma.resume.findUnique).toHaveBeenCalledTimes(1);

    // resumdId 제대로 전달됨?
    expect(resumeRepository.prisma.resume.findUnique).toHaveBeenCalledWith({
        where: { resumeId: +resumeId },
        include: {
            user: true,
        }
    })
  })

  // 이력서 생성

  test('createresume Method', async () => {
    const mockReturn = 'findUnique String';
    mockPrisma.resume.create.mockReturnValue(mockReturn);

    const userId = 1;
    const title = 'jest Test';
    const content = 'nonononononononononon';
    const createdResume = await resumeRepository.createResume(userId, title, content);

    expect(createdResume).toBe(mockReturn);

    expect(resumeRepository.prisma.resume.create).toHaveBeenCalledTimes(1);
    expect(resumeRepository.prisma.resume.create).toHaveBeenCalledWith({
        data: {
            userId: +userId,
            title,
            content,
          }
    })
  });

  // 이력서 업데이트

  test('updateResume Method', async() => {
    const resumeId = 1;
    const userId = 1;
    const updatedData = {
        title: 'Updated Title',
        content: 'Updated Content'
    };

    const mockUpdate = jest.fn().mockResolvedValue('updatedResume');
    const mockCreate = jest.fn().mockResolvedValue('createdUserHistory');

    mockPrisma.$transaction = jest.fn().mockImplementation(async (callback) => {
        await callback({
            resume: {
                mockUpdate,
            },
            userHistories: {
                mockCreate,
            }
        });
    });

    await resumeRepository.updateResume(resumeId, updatedData, userId);
    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(mockCreate).toHaveBeenCalledTimes(Object.keys(updatedData).length); // userHistories.create가 updatedData의 필드 수만큼 호출되었는지 확인
  })

  // 유저 이력서 삭제
  test('deleteResume Method', async() => {
    const resumeId = 1;
    const mockReturn = 'deletedResume';
    mockPrisma.resume.delete.mockResolvedValue(mockReturn);

    const deletedResume = await resumeRepository.deleteResume(resumeId);

    expect(deletedResume).toBe(mockReturn);
    expect(mockPrisma.resume.delete).toHaveBeenCalledTimes(1);
    expect(mockPrisma.resume.delete).toHaveBeenCalledWith({ where: { resumeId: resumeId }});
  })

  // 관리자 이력서 조회
  test('adminGetResume Method',async()=>{
    const mockReturn = ['resume1','resume2','resume3','resume4', 'resume5'];
    mockPrisma.resume.findMany.mockResolvedValue(mockReturn);

    const allResumes = await resumeRepository.getAllResumes();

    expect(allResumes).toBe(mockReturn);
    expect(mockPrisma.resume.findMany).toHaveBeenCalledTimes(1);
  })

  // 관리자 이력서 수정
  test('updateResumeWithHistory Method', async() => {
    const resumeId = 1;
    const oldResume = {
        userId: 1,
        title: 'Old Title',
        content: 'Old Content'
    };
    const updatedData = {
        title: 'Updated Title',
        content: 'Updated Content'
    };

    const mockUpdate = jest.fn().mockResolvedValue('updatedResume');
    const mockCreate = jest.fn().mockResolvedValue('createdUserHistory');

    mockPrisma.$transaction = jest.fn().mockImplementation(async (callback) => {
        await callback({
            resume: {
                update: mockUpdate,
            },
            userHistories: {
                create: mockCreate,
            }
        });
    });

    await resumeRepository.updateResumeWithHistory(resumeId, updatedData, oldResume);

    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
    expect(mockUpdate).toHaveBeenCalledTimes(1); // resume.update가 한 번 호출되었는지 확인
    expect(mockCreate).toHaveBeenCalledTimes(Object.keys(updatedData).length); // userHistories.create가 updatedData의 필드 수만큼 호출되었는지 확인
});
    // 관리자 이력서 삭제
    test('deleteAdminResume Method', async () => {
        const resumeId = 1;
        const mockReturn = 'deletedResume';
        mockPrisma.resume.delete.mockResolvedValue(mockReturn);

        await resumeRepository.deleteAdminResume(resumeId);
        expect(mockPrisma.resume.delete).toHaveBeenCalledTimes(1);
        expect(mockPrisma.resume.delete).toHaveBeenCalledWith({ where: { resumeId: resumeId}})
    });
});