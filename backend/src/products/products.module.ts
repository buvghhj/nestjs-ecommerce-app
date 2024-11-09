import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from '../guards/roles.guard';
import { MongooseModule } from '@nestjs/mongoose';
import { Products, ProductSchema } from '../schemas/product.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { StripeModule } from 'nestjs-stripe';
import config from 'config';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { ProductRepository } from '../repositories/product.repository';
import { UserRepository } from '../repositories/user.repository';
import { UsersService } from '../users/users.service';
import { License, LicenseSchema } from '../schemas/license.schema';
import { Orders, OrderSchema } from '../schemas/order.schema';
import { OrderRepository } from '../repositories/order.repository';

@Module({

  controllers: [
    ProductsController
  ],

  providers: [

    ProductsService,

    UsersService,

    ProductRepository,

    UserRepository,

    OrderRepository,

    {
      provide: APP_GUARD,
      useClass: RolesGuard
    }

  ],

  imports: [

    MongooseModule.forFeature([

      {
        name: Products.name,
        schema: ProductSchema
      }

    ]),

    MongooseModule.forFeature([

      {
        name: User.name,
        schema: UserSchema
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
      apiVersion: '2024-06-20',

    })

  ]

})
export class ProductsModule implements NestModule {

  configure(consumer: MiddlewareConsumer) {

    consumer.apply(AuthMiddleware).exclude(
      {
        path: `${config.get('apiPrefix')}/products`,

        method: RequestMethod.GET

      },
      {
        path: `${config.get('apiPrefix')}/products/:id`,

        method: RequestMethod.GET

      }
    ).forRoutes(ProductsController)

  }

}
