//src/auth/auth.service.ts
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuthEntity } from './entity/auth.entity';
import { roundsOfHashing } from 'src/users/users.module';
import { Observable, map, firstValueFrom, lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import querystring from 'querystring';
import { UsersService } from 'src/users/users.service';
import { environment } from 'src/environment/environment';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private httpService: HttpService,
    private usersService: UsersService,
  ) {}

  async login(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email: email } });

    if (!user) {
      throw new NotFoundException(`No user found for email: ${email}`);
    }

    const bcrypt = require('bcryptjs');
    const isPasswordValid = await bcrypt.compare(password, user.hash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }
    if (user.is2faEnabled == false)
      return {
        username: user.username,
        accessToken: this.jwtService.sign({ userId: user.id }),
      };
    else return { id: user.id };
  }

  async login42(profile: any): Promise<any> {
    let user = await this.prisma.user.findUnique({
      where: { email: profile.email },
    });

    if (!user) {
      user = await this.usersService.create({
        email: profile.email,
        username: profile.login,
        password: 'blank',
      });
      await this.usersService.updateImg(user.id, profile.image.link);
    }

    if (user.is2faEnabled == false)
      return {
        username: user.username,
        accessToken: this.jwtService.sign({ userId: user.id }),
      };
    else return { id: user.id };
  }

  async exchangeCodeForAccessToken(code: string): Promise<any> {
    const formData = new FormData();
    formData.append('grant_type', 'authorization_code');
    formData.append('client_id', environment.ft_client_id);
    formData.append('client_secret', environment.ft_client_secret);
    formData.append('code', code);
    formData.append('redirect_uri', 'http://localhost:8080/login');

    const response = await firstValueFrom(
      this.httpService.post('https://api.intra.42.fr/oauth/token', formData),
    );
    return response.data;
  }

  async fetch42Profile(accessToken: string): Promise<any> {
    const url = 'https://api.intra.42.fr/v2/me';
    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };

    const response = await lastValueFrom(
      this.httpService.get(url, { headers }),
    );

    return response.data;
  }

  async login2fa(id: number): Promise<AuthEntity> {
    const user = await this.prisma.user.findUnique({ where: { id: id } });

    if (!user) {
      throw new NotFoundException(`No user found.`);
    }

    return {
      username: user.username,
      accessToken: this.jwtService.sign({ userId: id }),
    };
  }
}
