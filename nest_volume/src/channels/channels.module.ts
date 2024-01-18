import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { UsersModule } from "src/users/users.module";
import { ChannelsService } from "./channels.service";
import { ChannelsController } from "./channels.controller";

@Module({
    controllers: [ChannelsController],
    providers: [ChannelsService],
    imports: [PrismaModule, UsersModule],
    exports: [ChannelsService],
  })
export class ChannelsModule {}