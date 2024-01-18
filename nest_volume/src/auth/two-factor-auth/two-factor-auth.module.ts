import { Module } from '@nestjs/common';
import { TwoFactorAuthService } from './two-factor-auth.service';

@Module({
  providers: [TwoFactorAuthService],
  exports: [TwoFactorAuthService]
})
export class TwoFactorAuthModule {}