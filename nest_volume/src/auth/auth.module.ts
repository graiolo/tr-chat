import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersModule } from 'src/users/users.module';
import { JwtStrategy } from './jwt.strategy';
import { HttpModule } from '@nestjs/axios';
import { TwoFactorAuthService } from './two-factor-auth/two-factor-auth.service';
import { environment } from 'src/environment/environment';

export const jwtSecret = environment.jwt_secret;

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.register({
      secret: environment.jwt_secret,
      signOptions: { expiresIn: '1h' }, // e.g. 7d, 24h
    }),
    UsersModule,
    HttpModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, TwoFactorAuthService],
})
export class AuthModule {}
