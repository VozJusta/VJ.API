import { Global, Module } from '@nestjs/common';
import { HashingServiceProtocol } from './hash/hashing.service';
import { BcryptService } from './hash/bcrypt.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Global()
@Module({
    providers: [
        {
            provide: HashingServiceProtocol,
            useClass: BcryptService
        },
        AuthService
    ],
    exports: [HashingServiceProtocol],
    controllers: [AuthController]
})
export class AuthModule {}
