import { Injectable, Scope } from "@nestjs/common";
import { Strategy } from 'passport-google-oauth20'
import { PassportStrategy } from '@nestjs/passport'

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor() {
        super({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: 'http://localhost:3001/auth/google/callback',
            scope: ['email', 'profile']
        })
    }

    async validate(accessToken, refreshToken, profile) {
        const { name, emails } = profile

        return {
            email: emails[0].value,
            fistName: name.givenName,
            lastName: name.familyName
        }
    }
}