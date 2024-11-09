import { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";
import { map, Observable } from "rxjs";

export interface Response<T> {
    message: string
    success: boolean
    result: any
    error: null
    timestamps: Date
    statusCode: number
    path?: string
}

export class TranformationInterceptor<T> implements NestInterceptor<T, Response<T>> {

    intercept(ctx: ExecutionContext, next: CallHandler): Observable<Response<T>> {

        const statusCode = ctx.switchToHttp().getResponse().statusCode

        const path = ctx.switchToHttp().getRequest().url

        return next.handle().pipe(map((data) => ({

            message: data?.message || 'No message available',
            success: data?.success || false,
            result: data?.result || null,
            timestamps: new Date(),
            statusCode,
            path,
            error: null

        })))

    }
}