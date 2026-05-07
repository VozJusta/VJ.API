import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailValidationService {
  private readonly emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  async validate(email: string) {
    if (!email) {
      return false;
    }

    return this.emailPattern.test(email.trim());
  }
}