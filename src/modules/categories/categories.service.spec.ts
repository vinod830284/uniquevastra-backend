import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { CategoriesRepository } from './repositories/categories.repository';
import { BadRequestException } from '@nestjs/common';

describe('CategoriesService (Hierarchy & Cycle Prevention Unit Tests)', () => {
  let service: CategoriesService;

  const mockRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findBySlug: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    archive: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: CategoriesRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    jest.clearAllMocks();
  });

  it('Should throw BadRequestException if category attempts to set itself as parent', async () => {
    mockRepository.findById.mockResolvedValue({ id: 'cat-A', name: 'Category A' });

    await expect(
      service.update('cat-A', { parentId: 'cat-A' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('Should throw BadRequestException on circular category hierarchy (A -> B -> A)', async () => {
    // Cat A parent is B
    // We try to update Cat B to have parent A
    mockRepository.findById.mockImplementation((id: string) => {
      if (id === 'cat-B') return Promise.resolve({ id: 'cat-B', name: 'Cat B', parentId: null });
      if (id === 'cat-A') return Promise.resolve({ id: 'cat-A', name: 'Cat A', parentId: 'cat-B' });
      return Promise.resolve(null);
    });

    await expect(
      service.update('cat-B', { parentId: 'cat-A' }),
    ).rejects.toThrow(BadRequestException);
  });
});
