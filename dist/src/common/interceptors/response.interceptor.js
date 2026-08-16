"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransformInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
let TransformInterceptor = class TransformInterceptor {
    intercept(context, next) {
        return next.handle().pipe((0, operators_1.map)((result) => {
            if (result && typeof result === 'object' && 'success' in result && 'data' in result) {
                return result;
            }
            let message = 'Operation successful';
            let data = result;
            let meta = undefined;
            if (result && typeof result === 'object' && 'meta' in result && result.meta && ('items' in result || 'data' in result)) {
                meta = result.meta;
                data = result.data !== undefined ? result.data : result.items;
                message = result.message || message;
            }
            else if (result && typeof result === 'object' && 'message' in result && 'data' in result) {
                message = result.message;
                data = result.data;
            }
            return {
                success: true,
                message,
                data,
                ...(meta ? { meta } : {}),
            };
        }));
    }
};
exports.TransformInterceptor = TransformInterceptor;
exports.TransformInterceptor = TransformInterceptor = __decorate([
    (0, common_1.Injectable)()
], TransformInterceptor);
//# sourceMappingURL=response.interceptor.js.map