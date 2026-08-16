"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting UniqueVastra Phase 5 realistic database seeding...');
    const superAdminHash = await bcrypt.hash('SuperAdmin@123', 12);
    await prisma.adminUser.upsert({
        where: { email: 'superadmin@uniquevastra.com' },
        update: {},
        create: {
            name: 'Super Admin',
            email: 'superadmin@uniquevastra.com',
            phone: '+919999999999',
            passwordHash: superAdminHash,
            role: client_1.AdminRole.SUPER_ADMIN,
        },
    });
    const customerHash = await bcrypt.hash('CustomerPass@123', 12);
    await prisma.user.upsert({
        where: { email: 'customer@uniquevastra.com' },
        update: {},
        create: {
            name: 'John Customer',
            email: 'customer@uniquevastra.com',
            phone: '+919876543210',
            passwordHash: customerHash,
            status: client_1.UserStatus.ACTIVE,
        },
    });
    const categoriesData = [
        { name: 'Clothing', slug: 'clothing', description: 'All streetwear apparel', parentSlug: null, sort: 1 },
        { name: 'T-Shirts', slug: 't-shirts', description: 'Streetwear T-Shirts', parentSlug: 'clothing', sort: 2 },
        { name: 'Oversized T-Shirts', slug: 'oversized-t-shirts', description: 'Heavyweight drop shoulder tees', parentSlug: 't-shirts', sort: 3 },
        { name: 'Hoodies', slug: 'hoodies', description: 'Heavyweight fleece hoodies', parentSlug: 'clothing', sort: 4 },
        { name: 'Sweatshirts', slug: 'sweatshirts', description: 'Crewneck sweatshirts', parentSlug: 'clothing', sort: 5 },
        { name: 'Anime', slug: 'anime', description: 'Official & custom anime streetwear', parentSlug: 'clothing', sort: 6 },
        { name: 'Gaming', slug: 'gaming', description: 'Esports & retro gaming apparel', parentSlug: 'clothing', sort: 7 },
        { name: 'Streetwear', slug: 'streetwear', description: 'Urban oversized fits & aesthetics', parentSlug: 'clothing', sort: 8 },
    ];
    const categoryMap = new Map();
    for (const c of categoriesData) {
        const parentId = c.parentSlug ? categoryMap.get(c.parentSlug) : null;
        const created = await prisma.category.upsert({
            where: { slug: c.slug },
            update: { name: c.name, parentId, status: client_1.CategoryStatus.ACTIVE, sortOrder: c.sort },
            create: {
                name: c.name,
                slug: c.slug,
                description: c.description,
                parentId,
                status: client_1.CategoryStatus.ACTIVE,
                sortOrder: c.sort,
            },
        });
        categoryMap.set(c.slug, created.id);
    }
    console.log('✅ Categories hierarchy seeded');
    const collectionsData = [
        { name: 'New Drop', slug: 'new-drop', description: 'Latest released oversized fits', isFeatured: true, sort: 1 },
        { name: 'Anime Collection', slug: 'anime-collection', description: 'Popular anime inspired graphics', isFeatured: true, sort: 2 },
        { name: 'Gaming Collection', slug: 'gaming-collection', description: 'Esports and arcade aesthetics', isFeatured: true, sort: 3 },
        { name: 'Minimal Streetwear', slug: 'minimal-streetwear', description: 'Clean graphicless heavyweight tees', isFeatured: false, sort: 4 },
        { name: 'Summer Essentials', slug: 'summer-essentials', description: 'Breathable combed cotton summer wear', isFeatured: true, sort: 5 },
    ];
    const collectionMap = new Map();
    for (const col of collectionsData) {
        const created = await prisma.collection.upsert({
            where: { slug: col.slug },
            update: { name: col.name, status: client_1.CollectionStatus.ACTIVE, isFeatured: col.isFeatured },
            create: {
                name: col.name,
                slug: col.slug,
                description: col.description,
                status: client_1.CollectionStatus.ACTIVE,
                isFeatured: col.isFeatured,
                sortOrder: col.sort,
            },
        });
        collectionMap.set(col.slug, created.id);
    }
    console.log('✅ Collections seeded');
    const products = [
        {
            name: 'Cyberpunk Neon Genesis Tee',
            slug: 'cyberpunk-neon-genesis-tee',
            categorySlug: 'anime',
            collectionSlugs: ['new-drop', 'anime-collection'],
            price: 1299,
            compareAtPrice: 1999,
            costPrice: 420,
            fit: 'Oversized',
            fabric: '240 GSM 100% French Terry Cotton',
            image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800',
        },
        {
            name: 'Shadow Domain Oversized Hoodie',
            slug: 'shadow-domain-oversized-hoodie',
            categorySlug: 'hoodies',
            collectionSlugs: ['new-drop', 'minimal-streetwear'],
            price: 2499,
            compareAtPrice: 3499,
            costPrice: 850,
            fit: 'Oversized Boxy',
            fabric: '380 GSM Heavy Fleece Cotton',
            image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800',
        },
    ];
    const colors = ['Washed Black', 'Off White', 'Navy Blue', 'Olive Green'];
    const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
    for (const p of products) {
        const categoryId = categoryMap.get(p.categorySlug) || categoryMap.get('t-shirts');
        const existingProduct = await prisma.product.findUnique({
            where: { slug: p.slug },
        });
        if (!existingProduct) {
            const createdProduct = await prisma.product.create({
                data: {
                    name: p.name,
                    slug: p.slug,
                    shortDescription: `${p.fit} streetwear tee in ${p.fabric}.`,
                    description: `The ${p.name} features custom UniqueVastra high-density graphics, drop shoulder boxy silhouette, and pre-shrunk ${p.fabric}. Built for maximum comfort and durability.`,
                    brand: 'UniqueVastra',
                    categoryId,
                    status: client_1.ProductStatus.ACTIVE,
                    isFeatured: true,
                    isNewArrival: true,
                    isBestSeller: false,
                    fabricDetails: p.fabric,
                    careInstructions: 'Machine wash cold inside out, tumble dry low, do not iron directly on print.',
                    fit: p.fit,
                    images: {
                        create: [
                            {
                                url: p.image,
                                altText: `${p.name} Front View`,
                                isPrimary: true,
                                sortOrder: 1,
                            },
                        ],
                    },
                },
            });
            for (const size of sizes) {
                const sku = `UV-${p.slug.toUpperCase().replace(/-/g, '').slice(0, 10)}-${size}`;
                const variant = await prisma.productVariant.create({
                    data: {
                        productId: createdProduct.id,
                        sku,
                        size,
                        color: colors[0],
                        colorCode: '#1A1A1A',
                        price: p.price,
                        compareAtPrice: p.compareAtPrice,
                        costPrice: p.costPrice,
                        status: client_1.VariantStatus.ACTIVE,
                    },
                });
                await prisma.inventory.create({
                    data: {
                        variantId: variant.id,
                        stock: 50,
                        reservedStock: 0,
                        lowStockThreshold: 5,
                    },
                });
            }
        }
    }
    const coupons = [
        {
            code: 'WELCOME10',
            type: client_1.CouponType.PERCENTAGE,
            value: 10,
            minimumOrderValue: 499,
            maximumDiscount: 200,
            startDate: new Date('2026-01-01'),
            endDate: new Date('2028-12-31'),
            usageLimit: 10000,
            perUserLimit: 1,
            status: client_1.CouponStatus.ACTIVE,
        },
        {
            code: 'FLAT100',
            type: client_1.CouponType.FIXED,
            value: 100,
            minimumOrderValue: 999,
            startDate: new Date('2026-01-01'),
            endDate: new Date('2028-12-31'),
            usageLimit: 5000,
            perUserLimit: 1,
            status: client_1.CouponStatus.ACTIVE,
        },
        {
            code: 'FREESHIP',
            type: client_1.CouponType.FREE_DELIVERY,
            value: 0,
            minimumOrderValue: 299,
            startDate: new Date('2026-01-01'),
            endDate: new Date('2028-12-31'),
            usageLimit: 5000,
            perUserLimit: 2,
            status: client_1.CouponStatus.ACTIVE,
        },
    ];
    for (const c of coupons) {
        await prisma.coupon.upsert({
            where: { code: c.code },
            update: {},
            create: c,
        });
    }
    console.log('✅ Promotional coupons (WELCOME10, FLAT100, FREESHIP) seeded!');
    console.log('🚀 Phase 5 Complete Seeding completed successfully!');
}
main()
    .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map