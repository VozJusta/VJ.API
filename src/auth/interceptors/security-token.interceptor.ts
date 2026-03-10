import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Observable, tap } from "rxjs";

@Injectable()
export class SecurityTokenInterceptor implements NestInterceptor {
    constructor(private readonly jwtService: JwtService) { }

    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
        const response = context.switchToHttp().getResponse()

        return next.handle().pipe(
            tap((data) => {
                if (data?.validated === true) {
                    const token = this.jwtService.sign(
                        { type: 'security' },
                        { expiresIn: '10m' }
                    )

                    response.setHeader('x-security-token', token)
                }
            })
        )
    }
}