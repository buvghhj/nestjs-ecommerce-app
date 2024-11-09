import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserRepository } from '../repositories/user.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../schemas/user.schema';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from '../guards/roles.guard';
import { AuthMiddleware } from '../middlewares/auth.middleware';

@Module({

  controllers: [UsersController],

  providers: [

    UsersService,

    UserRepository,

    {
      provide: APP_GUARD,
      useClass: RolesGuard
    }

  ],

  imports: [

    MongooseModule.forFeature([

      {
        name: User.name,
        schema: UserSchema
      }

    ])

  ],

  exports: [

    UsersService

  ]

})
export class UsersModule implements NestModule {

  configure(consumer: MiddlewareConsumer) {

    consumer.apply(AuthMiddleware).forRoutes({ path: '/users', method: RequestMethod.GET })

  }

}
