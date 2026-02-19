import { Global, Module } from '@nestjs/common';
import { HashingServiceProtocol } from './hash/hashing.service';
import { BcrypService } from './hash/bcrypt.service';

@Global()
@Module({
    providers: [
        {
            provide: HashingServiceProtocol,
            useClass: BcrypService
        }
    ],
    exports: [HashingServiceProtocol]
})
export class AuthModule {}
