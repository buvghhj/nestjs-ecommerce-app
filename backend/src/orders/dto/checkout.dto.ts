import { Type } from 'class-transformer'
import { ArrayMinSize, IsArray, IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator'

export class CheckoutDto {

    @IsString()
    @IsNotEmpty()
    skuPriceId: string

    @IsNumber()
    @IsNotEmpty()
    quantity: number

    @IsString()
    @IsNotEmpty()
    skuId: string

}

export class CheckoutDtoArr {

    @IsArray()
    @IsNotEmpty()
    @ValidateNested({ each: true })
    @ArrayMinSize(1)
    @Type(() => CheckoutDto)
    checkoutDetails: CheckoutDto[]

}