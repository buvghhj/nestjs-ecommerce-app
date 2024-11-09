import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator"
import { baseType, categoryType, platformType, SkuDetails } from "../../schemas/product.schema"

export class CreateProductDto {

    @IsString()
    @IsNotEmpty()
    productName: string

    @IsString()
    @IsNotEmpty()
    description: string

    @IsString()
    @IsOptional()
    image?: string

    @IsOptional()
    imageDetails?: Record<string, any>

    @IsString()
    @IsNotEmpty()
    @IsEnum(categoryType)
    category: string

    @IsString()
    @IsNotEmpty()
    @IsEnum(platformType)
    platformType: string

    @IsString()
    @IsNotEmpty()
    @IsEnum(baseType)
    baseType: string

    @IsString()
    @IsNotEmpty()
    productUrl: string

    @IsString()
    @IsNotEmpty()
    downloadUrl: string

    @IsArray()
    @IsNotEmpty()
    requirementSpecification: Record<string, any>[]

    @IsArray()
    @IsNotEmpty()
    hightlights: string[]

    @IsString()
    @IsOptional()
    stripeProductId?: string

    @IsOptional()
    @IsArray()
    skuDetails: SkuDetails[]

}
