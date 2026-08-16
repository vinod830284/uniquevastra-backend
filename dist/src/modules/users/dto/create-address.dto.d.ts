import { AddressType } from '@prisma/client';
export declare class CreateAddressDto {
    name: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country?: string;
    isDefault?: boolean;
    type?: AddressType;
}
