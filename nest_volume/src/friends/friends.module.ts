import { Module } from "@nestjs/common";
import { FriendsController } from "./friends.controller";
import { FriendsService } from "./friends.service";
import { PrismaModule } from "src/prisma/prisma.module";
import { UsersModule } from "src/users/users.module";

@Module({
    controllers: [FriendsController],
    providers: [FriendsService],
    imports: [UsersModule, PrismaModule],
    exports: [FriendsService],
  })
  export class FriendsModule {}