import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Observable, tap } from "rxjs";
import jwtConfig from "../config/jwt.config";
import { ConfigType } from "@nestjs/config";

@Injectable()
export class SecurityTokenInterceptor implements NestInterceptor {
    constructor(
        private readonly jwtService: JwtService,
        @Inject(jwtConfig.KEY)
        private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    ) { }

    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
        const response = context.switchToHttp().getResponse()

        return next.handle().pipe(
            tap((data) => {
                if (data?.validated === true) {
                    const token = this.jwtService.sign(
                        {
                            type: 'security',
                            sub: data?.sub,
                            role: data?.role,
                            email: data?.email,
                            fullName: data?.full_name,
                            loggedWithGoogle: data?.loggedWithGoogle
                        },
                        { expiresIn: '5m' }
                    )

                    response.setHeader('x-security-token', token)
                }
            })
        )
    }
}