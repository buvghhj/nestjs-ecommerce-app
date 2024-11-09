import { IsBoolean, IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, IsStrongPassword } from "class-validator"
import { UserType } from "src/schemas/user.schema"

export class CreateUserDto {

    @IsString()
    @IsNotEmpty()
    name: string

    @IsString()
    @IsNotEmpty()
    @IsEmail()
    email: string

    @IsString()
    @IsNotEmpty()
    @IsStrongPassword()
    password: string

    @IsString()
    @IsNotEmpty()
    @IsIn([UserType.ADMIN, UserType.CUSTOMER])
    type: string

    @IsString()
    @IsOptional()
    secretToken?: string

    @IsBoolean()
    @IsOptional()
    isVerified?: boolean

}
