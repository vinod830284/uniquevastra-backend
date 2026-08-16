export interface JwtPayload {
    userId: string;
    sub?: string;
    email: string;
    role?: string;
    isAdmin?: boolean;
    [key: string]: any;
}
export declare const CurrentUser: (...dataOrPipes: (string | import("@nestjs/common").PipeTransform<any, any> | import("@nestjs/common").Type<import("@nestjs/common").PipeTransform<any, any>> | undefined)[]) => ParameterDecorator;
