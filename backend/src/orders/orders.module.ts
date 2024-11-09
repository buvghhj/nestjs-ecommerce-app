import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrderRepository } from '../repositories/order.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Orders, OrderSchema } from '../schemas/order.schema';
import { UserRepository } from '../repositories/user.repository';
import { ProductRepository } from '../repositories/product.repository';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from '../guards/roles.guard';
import { StripeModule } from 'nestjs-stripe';
import config from 'config';
import { User, UserSchema } from '../schemas/user.schema';
import { Products, ProductSchema } from '../schemas/product.schema';
import { License, LicenseSchema } from '../schemas/license.schema';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { UsersModule } from '../users/users.module';

@Module({

  controllers: [

    OrdersController

  ],

  providers: [

    OrdersService,

    UserRepository,

    ProductRepository,

    OrderRepository,

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

    ]),

    MongooseModule.forFeature([

      {
        name: Products.name,
        schema: ProductSchema
      }

    ]),

    MongooseModule.forFeature([

      {
        name: License.name,
        schema: LicenseSchema
      }

    ]),

    MongooseModule.forFeature([

      {
        name: Orders.name,
        schema: OrderSchema
      }

    ]),

    StripeModule.forRoot({

      apiKey: config.get('stripe.secret_key'),
      apiVersion: '2024-06-20'

    }),

    UsersModule

  ]

})
export class OrdersModule implements NestModule {

  configure(consumer: MiddlewareConsumer) {

    consumer
      .apply(AuthMiddleware)
      .exclude({
        path: `${config.get('apiPrefix')}/orders/webhook`,
        method: RequestMethod.POST
      })
      .forRoutes(OrdersController)

  }

}
