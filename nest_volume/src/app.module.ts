import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { HttpModule } from '@nestjs/axios';
import { RedirectionGateway } from './oauthRedirection/redirection.gateway';
import { FriendsModule } from './friends/friends.module';
import { ChatModule } from './chat/chat.module';
import { PongModule } from './game/game.module';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, HttpModule, FriendsModule, ChatModule, PongModule],
  controllers: [AppController],
  providers: [AppService, RedirectionGateway],
})
export class AppModule {}
