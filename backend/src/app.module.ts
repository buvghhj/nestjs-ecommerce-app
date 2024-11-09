import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import config from 'config';
import { AllExceptionFilter } from './middlewares/http-exception.filter';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { AppController } from './app.controller';

@Module({

  imports: [

    MongooseModule.forRoot(config.get('mongodbUrl')),

    UsersModule,

    ProductsModule,

    OrdersModule

  ],

  providers: [

    {
      provide: 'APP_FILTER',
      useClass: AllExceptionFilter
    },

  ],

  controllers: [

    AppController

  ]

})
export class AppModule { }
