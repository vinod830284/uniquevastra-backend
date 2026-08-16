import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { ProductsRepository } from './repositories/products.repository';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { ProductStatus } from '@prisma/client';

describe('ProductsService (Catalog Unit Tests)', () => {
  let service: ProductsService;

  const mockRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findBySlug: jest.fn(),
    findVariantBySku: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    setStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: ProductsRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    jest.clearAllMocks();
  });

  it('Should throw ConflictException if product slug already exists', async () => {
    mockRepository.findBySlug.mockResolvedValue({ id: 'existing-id' });

    await expect(
      service.create({
        name: 'Existing Slug Product',
        slug: 'existing-slug',
        description: 'Test description',
        categoryId: 'cat-123',
        variants: [
          {
            sku: 'SKU-001',
            size: 'M',
            color: 'Black',
            price: 999,
          },
        ],
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('Should throw BadRequestException if variant price is negative', async () => {
    mockRepository.findBySlug.mockResolvedValue(null);

    await expect(
      service.create({
        name: 'Invalid Price Product',
        slug: 'invalid-price',
        description: 'Test description',
        categoryId: 'cat-123',
        variants: [
          {
            sku: 'SKU-NEG',
            size: 'M',
            color: 'Black',
            price: -100,
          },
        ],
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('Should throw BadRequestException when trying to publish product without images or variants', async () => {
    mockRepository.findById.mockResolvedValue({
      id: 'prod-incomplete',
      name: 'Draft Product',
      categoryId: 'cat-1',
      variants: [],
      images: [],
    });

    await expect(service.publish('prod-incomplete')).rejects.toThrow(BadRequestException);
  });

  it('Should duplicate product as DRAFT with new unique SKUs and slug', async () => {
    const sourceProduct = {
      id: 'source-id',
      name: 'Source Hoodie',
      slug: 'source-hoodie',
      shortDescription: 'Short desc',
      description: 'Full desc',
      brand: 'UniqueVastra',
      categoryId: 'cat-hoodies',
      status: ProductStatus.ACTIVE,
      isFeatured: true,
      images: [{ url: 'http://example.com/img1.jpg', sortOrder: 1, isPrimary: true }],
      variants: [{ sku: 'UV-HD-BLK-M', size: 'M', color: 'Black', price: 2000, status: 'ACTIVE' }],
      createdAt: new Date(),
    };

    mockRepository.findById.mockResolvedValue(sourceProduct);
    mockRepository.findBySlug.mockResolvedValue(null);
    mockRepository.findVariantBySku.mockResolvedValue(null);
    mockRepository.create.mockImplementation((dto) => ({
      ...dto,
      id: 'new-dup-id',
      category: { id: dto.categoryId, name: 'Hoodies', slug: 'hoodies' },
      images: dto.images,
      variants: dto.variants.map((v: any) => ({ ...v, id: 'v-new-id' })),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const duplicated = await service.duplicate('source-id');
    expect(duplicated.name).toBe('Source Hoodie (Copy)');
    expect(duplicated.status).toBe(ProductStatus.DRAFT);
    expect(duplicated.slug).toContain('source-hoodie-copy-');
    expect(duplicated.variants[0].sku).toContain('UV-HD-BLK-M-COPY-');
  });
});
