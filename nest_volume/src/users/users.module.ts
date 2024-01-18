import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TwoFactorAuthService } from 'src/auth/two-factor-auth/two-factor-auth.service';
import { environment } from 'src/environment/environment';

export const roundsOfHashing:number = environment.rounds_of_hashing;

@Module({
  controllers: [UsersController],
  providers: [TwoFactorAuthService, UsersService],
  imports: [PrismaModule],
  exports: [UsersService],
})
export class UsersModule {}
