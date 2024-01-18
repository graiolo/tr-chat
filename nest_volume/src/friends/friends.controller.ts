import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User } from '@prisma/client';
import { GetUser } from 'src/users/users.decorator';
import { UsersService } from 'src/users/users.service';

@Controller('friends')
@ApiTags('friends')
export class FriendsController {
  constructor(
    private friendsService: FriendsService,
    private usersService: UsersService,
  ) {}

  @Post('invite')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse()
  async inviteFriend(
    @GetUser() user: User,
    @Body('friend') friendName: string,
  ) {
    await this.friendsService.inviteFriend(user.id, friendName);
    return {okMessage: `Friend request correctly sent to ${friendName}`};
  }

  @Patch('accept')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse()
  async acceptFriendRequest(
    @GetUser() user: User,
    @Body('friend') friendName: string,
  ) {
    await this.friendsService.acceptFriendRequest(user.id, friendName);
    return {okMessage: `Now you and ${friendName} are friends`};
  }

  @Post('reject')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse()
  async rejectFriendRequest(
    @GetUser() user: User,
    @Body('friend') friendName: string,
  ) {
    await this.friendsService.rejectFriendRequest(user.id, friendName);
    return {okMessage: `Friend request from ${friendName} correctly rejected`};
  }

  @Post('delete')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse()
  async deleteFriend(
    @GetUser() user: User,
    @Body('friend') friendName: string,
  ) {
    const friend = await this.usersService.findUserByName(friendName);
    await this.friendsService.removeFriendship(user.id, friend.id);
    return {okMessage: `You removed ${friendName} from your friends`};
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse()
  async getFriends(@GetUser() user: User): Promise<any> {
    return await this.friendsService.getFriends(user.id);
  }

  @Get('requests/received')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse()
  async getReceivedFriendRequests(@GetUser() user: User) {
    return await this.friendsService.getReceivedFriendRequests(user.id);
  }

  @Get('requests/sent')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse()
  async getSentFriendRequests(@GetUser() user: User) {
    return await this.friendsService.getSentFriendRequests(user.id);
  }

  @Post('block')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse()
  async blockUser (
    @GetUser() user: User,
    @Body('to_block') toBlock: string,
  ) {
    const blocked = await this.usersService.findUserByName(toBlock);
    await this.friendsService.blockUser(user.id, blocked.id);
    return {okMessage: `${toBlock} has been blocked`};
  }

  @Post('unblock')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse()
  async unblockUser(
    @GetUser() user: User,
    @Body('to_unblock') toUnblock: string,
  ) {
    const blocked = await this.usersService.findUserByName(toUnblock);
    await this.friendsService.unblockUser(user.id, blocked.id);
    return {okMessage: `${toUnblock} has been unblocked`};
  }

  @Get('blockeds')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse()
  async getBlockeds(
    @GetUser() user: User
  ): Promise<any> {
    return await this.friendsService.getBlockeds(user.id);
  }
}
