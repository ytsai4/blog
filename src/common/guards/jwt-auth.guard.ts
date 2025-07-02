import { Injectable, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '@src/common/decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private reflector: Reflector) {
        super();
    }

    canActivate(context: ExecutionContext) {
        // Check if route is marked as public
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true; // skip auth
        }
        // Else, run default JWT auth guard
        return super.canActivate(context);
    }
    handleRequest(err, user, info, context: ExecutionContext) {
        if (err || !user) {
            throw err || new HttpException('未授權', HttpStatus.UNAUTHORIZED); // <- this is where it’s attached();
        }

        const req = context.switchToHttp().getRequest();
        req.UUID_User = user.UUID_User; // <- this is where it’s attached
        return user;
    }
}
