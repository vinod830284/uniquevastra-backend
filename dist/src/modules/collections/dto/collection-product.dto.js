"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReorderCollectionProductsDto = exports.ReorderCollectionProductItem = exports.AddCollectionProductDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class AddCollectionProductDto {
    productId;
    sortOrder;
}
exports.AddCollectionProductDto = AddCollectionProductDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-product-id' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], AddCollectionProductDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], AddCollectionProductDto.prototype, "sortOrder", void 0);
class ReorderCollectionProductItem {
    productId;
    sortOrder;
}
exports.ReorderCollectionProductItem = ReorderCollectionProductItem;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-product-id' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ReorderCollectionProductItem.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1 }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], ReorderCollectionProductItem.prototype, "sortOrder", void 0);
class ReorderCollectionProductsDto {
    items;
}
exports.ReorderCollectionProductsDto = ReorderCollectionProductsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [ReorderCollectionProductItem] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ReorderCollectionProductItem),
    __metadata("design:type", Array)
], ReorderCollectionProductsDto.prototype, "items", void 0);
//# sourceMappingURL=collection-product.dto.js.map