import {
  Controller,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetUser } from 'src/users/users.decorator';
import { UsersService } from 'src/users/users.service';

@Controller('channels')
@ApiTags('channels')
export class ChannelsController {
  constructor (
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  @Get(':channelId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse()
  async getChannel(
    @GetUser() user: User,
    @Param('channelId') channelId: string,
  ) {
        let channel = await this.prisma.channel.findUniqueOrThrow({
            where: {
                id: channelId,
            }
        });

        if (channel.type == 'DIRECT')
        {
            const peerMembership = await this.prisma.channelMembership.findFirstOrThrow({
                where: {
                    channelId,
                    userId: {
                        not: user.id,
                    },
                },
            })
            const peer = await this.usersService.findOne(peerMembership.userId);
            channel.name = peer.username;
        }

        return channel;
  }

  @Get('members/:channelId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse()
  async getChannelMembers(
    @Param('channelId') channelId: string,
  ) {
        const channelMembers = await this.prisma.channelMembership.findMany({
            where: {
                channelId,
            },
            include: {
                user: true,
            },
        });
        
        return channelMembers;
    }
}
