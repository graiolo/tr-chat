import { Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';

@Injectable()
export class TwoFactorAuthService {
  generateTwoFactorSecret() {
    const secret = speakeasy.generateSecret({ length: 20 });
    return {
      secretKey: secret.base32,
      otpauthUrl: secret.otpauth_url,
    };
  }

  async getTwoFactorAuthenticationCode(secret: string) {
    const otpauthUrl = speakeasy.otpauthURL({
      secret,
      encoding: 'base32',
      label: 'trascendence',
      issuer: 'fratCarnal',
    });
  return qrcode.toDataURL(otpauthUrl);
  }

  validateTwoFactorCode(secret: string, token: string) {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
    });
  }
}
