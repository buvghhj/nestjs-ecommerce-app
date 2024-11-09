import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import config from 'config';
import { TranformationInterceptor } from './middlewares/response.interceptor';
import cookieParser from 'cookie-parser';
import { NextFunction, raw, Request, Response } from 'express';
import csurf from 'csurf'
import { ValidationPipe } from '@nestjs/common';

const ROOT_IGNORED_PATHS = ['/api/v1/orders/webhook']

async function bootstrap() {

  const app = await NestFactory.create(AppModule, { rawBody: true })

  app.use(cookieParser())

  const csrfMiddleware = csurf({ cookie: { httpOnly: true } })

  app.use((req: Request, res: Response, next: NextFunction) => {

    if (ROOT_IGNORED_PATHS.includes(req.path)) {

      return next()

    }

    return csrfMiddleware(req, res, next)

  })

  app.use('/api/v1/orders/webhook', raw({ type: 'application/json' }))

  app.setGlobalPrefix(config.get('apiPrefix'))

  app.useGlobalInterceptors(new TranformationInterceptor())

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }))

  await app.listen(config.get('port') || 3000)

}
bootstrap()
