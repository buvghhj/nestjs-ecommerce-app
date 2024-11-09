import { IsOptional } from "class-validator"

export class UpdateUserDto {

    @IsOptional()
    name?: string

    @IsOptional()
    oldPassword?: string

    @IsOptional()
    newPassword?: string

}
