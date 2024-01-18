import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ChatGateway } from './chat.gateway'; 
import { UsersModule } from 'src/users/users.module';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { ChannelsModule } from 'src/channels/channels.module';

@Module({
  providers: [ChatGateway, JwtStrategy],
  imports: [UsersModule, ChannelsModule]
})
export class ChatModule {}
