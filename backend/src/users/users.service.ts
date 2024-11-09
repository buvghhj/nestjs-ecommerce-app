import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserType } from '../schemas/user.schema';
import config from 'config'
import { UserRepository } from '../repositories/user.repository';
import * as bcrypt from 'bcrypt'
import axios from 'axios';
import jwt from 'jsonwebtoken';
import FormData from 'form-data';

@Injectable()
export class UsersService {

  constructor(@Inject(UserRepository) private readonly userModel: UserRepository) { }

  //Hash password
  async generateHashPassword(password: string) {

    const salt = await bcrypt.genSalt(10)

    const hashPassword = await bcrypt.hash(password, salt)

    return hashPassword

  }

  //Compare password
  async comparePassword(password: string, hashPassword: string) {

    return await bcrypt.compare(password, hashPassword)

  }

  //Send Mail
  async sendEmail(to: string, templateName: string, subject: string, templateVars: Record<string, any> = {}) {

    try {

      const form = new FormData()

      form.append('to', to)
      form.append('template', templateName)
      form.append('subject', subject)
      form.append(
        'from',
        'mailgun@sandbox5eff730c1417446e914423ce9f7a57c9.mailgun.org'
      )

      Object.keys(templateVars).forEach((key) => {

        form.append(`v:${key}`, templateVars[key])

      })

      const username = 'api'
      const password = config.get('emailService.privateApiKey')
      const token = Buffer.from(`${username}:${password}`).toString('base64')

      const response = await axios({

        method: 'post',

        url: `https://api.mailgun.net/v3/${config.get('emailService.testDomain')}/messages`,

        headers: {
          Authorization: `Basic ${token}`,
          ...form.getHeaders()
        },

        data: form

      })

      return response

    } catch (error) {

      if (error.response) {

        console.error('Error status:', error.response.status)

        console.error('Error data:', error.response.data)

      } else {

        console.error('Error message:', error.message)

      }

      throw new Error('Failed to send email')

    }

  }

  //Create User
  async create(createUserDto: CreateUserDto) {

    try {

      createUserDto.password = await this.generateHashPassword(createUserDto.password)

      if (createUserDto.type === UserType.ADMIN && createUserDto.secretToken !== config.get('adminSecret')) {

        throw new Error('Not allow to create admin')

      } else if (createUserDto.type !== UserType.CUSTOMER) {

        createUserDto.isVerified = true

      }

      const user = await this.userModel.findOne({ email: createUserDto.email })

      if (user) {

        throw new Error('User already exists')

      }

      const otp = Math.floor(Math.random() * 900000) + 100000

      const otpExpiryTime = new Date()

      otpExpiryTime.setMinutes(otpExpiryTime.getMinutes() + 10)

      const newUser = await this.userModel.create({ ...createUserDto, otp, otpExpiryTime })

      if (newUser.type !== UserType.ADMIN) {

        this.sendEmail(
          newUser.email,
          config.get('emailService.emailTemplates.verifyEmail'),
          'Email Verifivation',
          {
            customerName: newUser.name,
            customerEmail: newUser.email,
            otp
          }
        )

      }

      return {
        success: true,
        message: newUser.type === UserType.ADMIN
          ? 'Admin created successfully'
          :
          'Please activate your account by verify your email. Web have send you a email with otp',
        result: { email: newUser.email }
      }

    } catch (error) {

      throw error

    }

  }

  //Sign Token
  async generateAuthToken(id: string) {

    return jwt.sign({ id }, config.get('tokenSecret'), { expiresIn: '30d' })

  }

  //Verify Token
  async decodedAuthToken(token: string) {

    return jwt.verify(token, config.get('tokenSecret'))

  }

  //Verify Email
  async verifyEmail(otp: string, email: string) {

    try {

      const user = await this.userModel.findOne({ email })

      if (!user) {

        throw new Error('User not found')

      }

      if (user.otp !== otp) {

        throw new Error('Invalid otp')

      }

      if (user.otpExpiryTime < new Date()) {

        throw new Error('Otp expired')

      }

      await this.userModel.updateOne({ email }, { isVerified: true })

      return {

        success: true,

        message: 'Email verified successfully, You can login now'

      }

    } catch (error) {

      throw error

    }
  }

  async sendOptEmail(email: string) {

    try {

      const user = await this.userModel.findOne({ email })

      if (!user) {

        throw new Error('User not found')

      }

      if (user.isVerified) {

        throw new Error('Email already verified')

      }

      const otp = Math.floor(Math.random() * 900000) + 100000

      const otpExpiryTime = new Date()

      otpExpiryTime.setMinutes(otpExpiryTime.getMinutes() + 10)

      await this.userModel.updateOne({ email }, { otp, otpExpiryTime })

      this.sendEmail(

        user.email,

        config.get('emailService.emailTemplates.verifyEmail'),

        'Email Verification',

        {
          customerName: user.name,
          customerEmail: user.email,
          otp
        }

      )

      return {

        success: true,
        message: 'Otp sent successfully',
        result: { email: user.email }

      }

    } catch (error) {

      throw error

    }

  }

  //Login
  async login(email: string, password: string) {

    try {

      const userExists = await this.userModel.findOne({ email })

      if (!userExists) {

        throw new Error('Invalid email or password')

      }

      if (!userExists.isVerified) {

        throw new Error('Please verify your email')

      }

      const isPasswordMatch = await this.comparePassword(password, userExists.password)

      if (!isPasswordMatch) {

        throw new Error('Invalid email or password')

      }

      const token = await this.generateAuthToken(userExists._id as string)

      return {

        success: true,

        message: 'Login successfully',

        result: {

          user: {
            name: userExists.name,
            email: userExists.email,
            type: userExists.type,
            id: userExists._id.toString()
          },

          token

        },

      }

    } catch (error) {

      throw error

    }

  }

  async forgotPassword(email: string) {

    try {

      const user = await this.userModel.findOne({ email })


      if (!user) {

        throw new Error('User not found')

      }

      let password = Math.random().toString(36).substring(2, 12)

      const tempPassword = password

      password = await this.generateHashPassword(password)

      await this.userModel.updateOne({ _id: user._id }, { password })

      this.sendEmail(

        user.email,

        config.get('emailService.emailTemplates.forgotPassword'),

        'Forgot Password',

        {
          customerName: user.name,
          customerEmail: user.email,
          newPassword: password,
          loginLink: config.get('loginLink')
        }

      )

      return {
        success: true,
        message: 'Password sent to your email',
        result: { email: user.email, password: tempPassword }
      }

    } catch (error) {

      throw error

    }

  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {

    try {

      const { oldPassword, newPassword, name } = updateUserDto

      if (!name && !newPassword) {

        throw new Error('Please provide name or password')

      }

      const user = await this.userModel.findOne({ _id: id })

      if (!user) {

        throw new Error('User not found')

      }

      if (newPassword) {

        const isMathPassword = await this.comparePassword(oldPassword, user.password)

        if (!isMathPassword) {

          throw new Error('Invalid old password')

        }

        const hashNewPassword = await this.generateHashPassword(newPassword)

        await this.userModel.updateOne({ _id: id }, { password: hashNewPassword })

      }

      if (name) {

        await this.userModel.updateOne({ _id: id }, { name })

      }

      return {
        success: true,
        message: 'User updated successfully',
        result: {
          name: user.name,
          email: user.email,
          type: user.type,
          id: user._id.toString()
        }
      }

    } catch (error) {

      throw error

    }

  }

  async findAll(type: string) {

    try {

      const users = await this.userModel.find({ type })

      return {
        success: true,
        message: 'Users fetched successfully',
        result: users
      }

    } catch (error) {

      throw error

    }

  }

}
