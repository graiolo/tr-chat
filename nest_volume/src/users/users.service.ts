import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { roundsOfHashing } from './users.module';
import { TwoFactorAuthService } from '../auth/two-factor-auth/two-factor-auth.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private readonly twoFactorAuthService: TwoFactorAuthService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const bcrypt = require('bcryptjs');
    const pwHash = await bcrypt.hash(createUserDto.password, roundsOfHashing);
    return this.prisma.user.create({
      data: {
        username: createUserDto.username,
        email: createUserDto.email,
        hash: pwHash,
      },
    });
  }

  async findAll() {
    return await this.prisma.user.findMany();
  }

  async findOne(id: number) {
    try {
      return await this.prisma.user.findUniqueOrThrow({ where: { id: id } });
    } catch(error) {
      throw new NotFoundException(`No user found with id: ${id}`);
    }
  }

  async findOneByEmail(email: string) {
    try {
      return await this.prisma.user.findUniqueOrThrow({ where: { email: email } });
    } catch(error) {
      throw new NotFoundException(`No user found with email: ${email}`);
    }
  }

  async findUserByName(name: string) {
    try {
      const user = await this.prisma.user.findUniqueOrThrow({ where: { username: name } });
      return user;
    } catch(error) {
      throw new NotFoundException(`No user found with username: ${name}`);
    }
  }

  async findChannelByName(name: string) {
    const channel = await this.prisma.channel.findUnique({ where: { name: name } });
    if (!channel)
      return null;
    return {
      id: channel.id,
      type: channel.type,
      name: channel.name,
      password: channel.password
    }
  }
  
  async findUserPublicData(username: string) {
    try {
      const user = await this.prisma.user.findUniqueOrThrow({
        where: { username: username },
      });
      
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        img: user.img,
        isOnline: user.isOnline,
        isPlaying: user.isPlaying,
        Wins: user.Wins,
        Losses: user.Losses,
        played: user.Played,
      };
    } catch(error) {
      throw new NotFoundException(`No user found with username: ${username}`);
    }
  }
  async findUserPublicDataNoThrow(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username: username },
    });
    if (!user)
      return null;
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      img: user.img,
      isOnline: user.isOnline,
      isPlaying: user.isPlaying,
      Wins: user.Wins,
      Losses: user.Losses,
      played: user.Played,
    };
  }
  async update(id: number, updateUserDto: UpdateUserDto) {
    const bcrypt = require('bcryptjs');
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(
        updateUserDto.password,
        roundsOfHashing,
      );
    }
    return this.prisma.user.update({ where: { id: id }, data: updateUserDto });
  }

  async updateImg(id: number, newImg: string) {
    return this.prisma.user.update({
      where: { id: id },
      data: { img: newImg },
    });
  }

  async updateOnline(id: number, newStatus: boolean) {
    return this.prisma.user.update({
      where: { id: id },
      data: { isOnline: newStatus },
    });
  }

  async updateIsPlaying(id: number, newStatus: boolean) {
    return this.prisma.user.update({
      where: { id: id },
      data: { isPlaying: newStatus },
    });
  }

  async update2faStatus(id: number, newStatus: boolean) {
    if (newStatus == true) {
      return this.prisma.user.update({
        where: { id: id },
        data: { is2faEnabled: true },
      });
    } else {
      return this.prisma.user.update({
        where: { id: id },
        data: { is2faEnabled: false, qrcode2fa: null, secret2fa: null },
      });
    }
  }

  async remove(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }

  async generateTwoFactorSecret(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id: id } });
    if (!user) {
      throw new NotFoundException(`No user found.`);
    }

    const { secretKey, otpauthUrl } =
      this.twoFactorAuthService.generateTwoFactorSecret();
    const qrUrl =
      await this.twoFactorAuthService.getTwoFactorAuthenticationCode(secretKey);
    await this.prisma.user.update({
      where: { id: id },
      data: { secret2fa: secretKey, qrcode2fa: qrUrl },
    });
    return { qrUrl: qrUrl };
  }

  async validateTwoFactorCode(id: number, token: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (user == null || user.is2faEnabled == false || user?.secret2fa == null)
      return false;
    const secretKey = user?.secret2fa as string;
    return this.twoFactorAuthService.validateTwoFactorCode(secretKey, token);
  }
}
