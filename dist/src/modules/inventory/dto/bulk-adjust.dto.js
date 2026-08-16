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
exports.BulkAdjustDto = exports.BulkAdjustItemDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class BulkAdjustItemDto {
    variantId;
    type;
    quantity;
    reason;
    referenceType;
    referenceId;
}
exports.BulkAdjustItemDto = BulkAdjustItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-variant-id' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], BulkAdjustItemDto.prototype, "variantId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.StockAdjustmentType, example: client_1.StockAdjustmentType.STOCK_IN }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(client_1.StockAdjustmentType),
    __metadata("design:type", String)
], BulkAdjustItemDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 10 }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], BulkAdjustItemDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Bulk warehouse intake' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BulkAdjustItemDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'BULK_IMPORT' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BulkAdjustItemDto.prototype, "referenceType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'REF-2026-BATCH1' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BulkAdjustItemDto.prototype, "referenceId", void 0);
class BulkAdjustDto {
    items;
}
exports.BulkAdjustDto = BulkAdjustDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [BulkAdjustItemDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => BulkAdjustItemDto),
    __metadata("design:type", Array)
], BulkAdjustDto.prototype, "items", void 0);
//# sourceMappingURL=bulk-adjust.dto.js.map