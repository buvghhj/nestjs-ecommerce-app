import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserType } from "../schemas/user.schema";
import { ROLES_KEY } from "../decorators/role.decorator";

@Injectable()
export class RolesGuard implements CanActivate {

    constructor(private reflector: Reflector) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {

        const requiredRoles = this.reflector.getAllAndOverride<UserType[]>(ROLES_KEY, [context.getHandler(), context.getClass()])

        if (!requiredRoles) {

            return true

        }

        const { user } = await context.switchToHttp().getRequest()

        return requiredRoles.some((role) => user.type?.includes(role))

    }

}