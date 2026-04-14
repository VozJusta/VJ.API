import { Injectable } from '@nestjs/common';
import { SignInDTO } from '../dto/signIn.dto';
import { ChangePasswordDTO } from '../dto/change-password.dto';
import { ForgotPasswordDTO } from '../dto/forgot-password.dto';
import { VerifyForgotCodeDTO } from '../dto/verify-forgot-code.dto';
import { SendCodeEmailDTO } from '../dto/sendCode-email.dto';
import { ValidateCodeEmailDTO } from '../dto/validateCode-email.dto';
import { AuthenticateService } from './authenticate.service';
import { ChangePasswordService } from './changePassword.service';
import { ForgotPasswordService } from './forgotPassword.service';
import { VerifyForgotCodeService } from './verifyForgotCode.service';
import { SendEmailService } from './sendEmail.service';
import { SendForgotPasswordEmailService } from './sendForgotPassword.service';
import { ValidateEmailCodeService } from './validateEmailCode.service';
import { AuthenticateGoogleLawyerService } from './authGoogleLawyer.service';
import { AuthenticateGoogleCitizenService } from './authGoogleCitizen.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly authenticateService: AuthenticateService,
    private readonly changePasswordService: ChangePasswordService,
    private readonly forgotPasswordService: ForgotPasswordService,
    private readonly verifyForgotCodeService: VerifyForgotCodeService,
    private readonly sendEmailService: SendEmailService,
    private readonly sendForgotPasswordEmailService: SendForgotPasswordEmailService,
    private readonly validateEmailCodeService: ValidateEmailCodeService,
    private readonly authenticateGoogleLawyerService: AuthenticateGoogleLawyerService,
    private readonly authenticateGoogleCitizenService: AuthenticateGoogleCitizenService,
  ) {}

  async authenticate(body: SignInDTO) {
    return this.authenticateService.authenticate(body);
  }

  async changePassword(body: ChangePasswordDTO, userId: string) {
    return this.changePasswordService.changePassword(body, userId);
  }

  async forgotPassword(body: ForgotPasswordDTO) {
    return this.forgotPasswordService.forgotPassword(body);
  }

  async verifyForgotCode(body: VerifyForgotCodeDTO) {
    return this.verifyForgotCodeService.verifyForgotCode(body);
  }

  async sendEmail(body: SendCodeEmailDTO) {
    return this.sendEmailService.sendEmail(body);
  }

  async sendForgotPasswordEmail(body: SendCodeEmailDTO) {
    return this.sendForgotPasswordEmailService.sendForgotPasswordEmail(body);
  }

  async validateEmailCode(body: ValidateCodeEmailDTO, token: string) {
    return this.validateEmailCodeService.validateEmailCode(body, token);
  }

  async authenticateGoogleLawyer(email: string, name: string) {
    return this.authenticateGoogleLawyerService.authenticateGoogleLawyer(
      email,
      name,
    );
  }

  async authenticateGoogleCitizen(email: string, name: string) {
    return this.authenticateGoogleCitizenService.authenticateGoogleCitizen(
      email,
      name,
    );
  }
}
