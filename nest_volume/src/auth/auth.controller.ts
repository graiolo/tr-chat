import {
  Body,
  Controller,
  Post,
  Get,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthEntity } from './entity/auth.entity';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { User } from '@prisma/client';
import { UsersService } from '../users/users.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private usersService: UsersService,
    private prisma: PrismaService,
  ) {}

  @Post('login')
  @ApiOkResponse({ type: AuthEntity })
  async login(@Body() { email, password }: LoginDto) {
    const entity = await this.authService.login(email, password);
    console.log(`\n\n\nlogin normale:\n${entity.accessToken}\n\n\n`);//for debug
    return entity;
  }

  @Post('42')
  @ApiOkResponse()
  async loginFortyTwo(@Body('code') code: string): Promise<any> {
    const token42 = await this.authService.exchangeCodeForAccessToken(code);
    const profile42data = await this.authService.fetch42Profile(
      token42.access_token,
    );
    const entity = await this.authService.login42(profile42data);
    console.log(`\n\n\nlogin 42:\n${entity.accessToken}\n\n\n`);//for debug
    return entity;
  }

  @Post('2fa-validate')
  @ApiOkResponse()
  async validateTwoFactorToken(
    @Body('userId') userId: string,
    @Body('token') token: string,
  ) {
    const id = Number(userId);
    const response: boolean = (await this.usersService.validateTwoFactorCode(
      id,
      token,
    )) as boolean;
    if (response == true) return await this.authService.login2fa(id);
    else return new UnauthorizedException('Invalid 2fa code');
  }
}
