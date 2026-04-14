import { HashingServiceProtocol } from "@m/auth/hash/hashing.service";
import * as bcrypt from 'bcryptjs'

export class BcryptService implements HashingServiceProtocol {
    async hash(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(12)
        return bcrypt.hash(password, salt)
    }

    async compare(password: string, passwordHash: string): Promise<boolean> {
        return bcrypt.compare(password, passwordHash)
    }
}