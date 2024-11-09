import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Res, Put, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import e, { Response } from 'express';
import { Roles } from '../decorators/role.decorator';
import { UserType } from '../schemas/user.schema';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: { email: string, password: string }, @Res({ passthrough: true }) response: Response) {

    const loginRes = await this.usersService.login(loginDto.email, loginDto.password)

    if (loginRes.success) {

      response.cookie('token', loginRes.result?.token, { httpOnly: true })

    }

    delete loginRes.result?.token;

    return loginRes

  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {

    return this.usersService.create(createUserDto)

  }

  @Get('/verify-email/:otp/:email')
  async verifyEmail(@Param('otp') otp: string, @Param('email') email: string) {

    return await this.usersService.verifyEmail(otp, email)

  }

  @Get('/send-otp-email/:email')
  async sendOtpEmail(@Param('email') email: string) {

    return await this.usersService.sendOptEmail(email)

  }

  @Put('/logout')
  async logout(@Res() res: Response) {

    res.clearCookie('token')

    return res.status(HttpStatus.OK).json({ success: true, message: 'Logout successfully' })

  }

  @Get('/forgot-password/:email')
  async forgotPassword(@Param('email') email: string) {

    return await this.usersService.forgotPassword(email)

  }

  @Patch('/update-user/:id')
  async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {

    return this.usersService.updateUser(id, updateUserDto)

  }

  @Get()
  @Roles(UserType.ADMIN)
  async findAll(@Query('type') type: string) {

    return await this.usersService.findAll(type)

  }

}
