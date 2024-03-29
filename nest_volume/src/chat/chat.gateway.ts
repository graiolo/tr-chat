import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { environment } from 'src/environment/environment';
import { UsersService } from 'src/users/users.service';
import * as jwt from 'jsonwebtoken';
import {JwtPayload} from 'jsonwebtoken'
import { ChannelsService } from 'src/channels/channels.service';
import { User } from '@prisma/client';
import { group } from 'console';
type MyJwtPayload = {
  userId: number,
} & JwtPayload;

interface ExtendedSocket extends Socket {
  user: any;
}

type Message = {
  msg:string,
  user:any
};

const userSocketMap: { [userId: string]: ExtendedSocket } = {};

@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor (
    private usersService: UsersService,
    private channelsService: ChannelsService
  ) {}

  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    console.log('\n\nInitialized!(chat)');
  }

  async handleConnection(client: ExtendedSocket, ...args: any[]) {
    console.log(`\n\nClient connected(chat): ${client.id}`);

    const token = client.handshake.auth.token;
    
    const secret = environment.jwt_secret as string;
    
    try {
      if (!token) throw Error;
      const decoded = jwt.verify(token, secret) as MyJwtPayload;
      const userId = decoded.userId;

      const user = await this.usersService.findOne(userId);
      client.user = user;
      userSocketMap[user.username] = client;
    } catch (error) {
      console.log('Authentication error');
      client.disconnect();
    }

  }

  handleDisconnect(client: ExtendedSocket) {
    console.log(`\n\nClient disconnected(chat): ${client.id}`);
    if (client.user && client.user.id) {
      delete userSocketMap[client.user.id];
    }
  }

  @SubscribeMessage('DeleteAllChannels')
  async deleteAllChannels(client: Socket) {
    await this.channelsService.deleteAllChannels();
  }

  @SubscribeMessage('DeleteChannel')
  async deleteChannel(client: Socket, payload: { channelId: string }) {
    const { channelId } = payload;
    await this.channelsService.rmChannel(channelId);
  }

  @SubscribeMessage('Authenticate')
  authentcate(client: Socket, payload: { token: string }): void {
    const { token } = payload;
    this.server.emit('Authenticate', { token });
  }

  @SubscribeMessage('PrivMsg')
  async handlePriv(client: Socket, payload: { sender: string, receiver: string, message: string }) {
    const { sender, receiver, message } = payload;
    //console.log({payload})
    const {newChannel, channel} = await this.channelsService.createDirectMessage(receiver, message, sender);
    ///TO DO: creare room della chat o mandarlo all'id dell'user nella map
    if(newChannel){
      client.emit('CreatedNewPublicChannel', {channel:{...channel, isGroup:false, name: receiver}});
      userSocketMap[receiver].emit('CreatedNewPublicChannel', {channel:{...channel, isGroup:false, name: sender},});
    }
    client.emit('MsgFromChannel', [{ user: sender, msg: message, channelId: channel.id , from: sender}]);
    userSocketMap[receiver].emit('MsgFromChannel', [{ user: sender, msg: message, channelId: channel.id , from: sender, allRead: false }]);
  }
  

  @SubscribeMessage("GetChannelId")
  async getChannelId(client: Socket, payload: { id: string}) {
    const { id } = payload;
    const channel = await this.channelsService.getChannelById(id);
    client.emit('ChannelId', {channelId: channel?.id} );
  }

  @SubscribeMessage("GetChannelById")
  async getChannelById(client: Socket, payload: { id: string}) {
    const { id } = payload;
    const channel = await this.channelsService.getChannelById(id);
    client.emit('Channel', {channel} );
  }

  @SubscribeMessage("ReceivePrivMsg")
  async receivePrivChannelMsg(client: Socket, payload: { sender: string, receiver: string}) {
    const { sender, receiver } = payload;
    const messages = await this.channelsService.getChannelMsg(sender, receiver);
    ///TO DO: creare room della chat o mandarlo all'id dell'user nella map
    client.emit('ReceiveMsgForChannel', messages.map(message=>{
        return {
          msg:message.content,
          user:message.sender.username,
          channelId: message.channelId,
          members:[sender, receiver]
        }
      })
    );
  }
  
  @SubscribeMessage("ReceiveUserList")
  async reciveUserList(client: Socket, payload: { id: string}) {
    const { id } = payload;
    const channels = await this.channelsService.getChannelById(id);
    const userlist: any = channels?.members.map((member:any)=>{
      return {
        username: member.user.usename,
        role: member.role
      }
    });
    client.emit('UserList', {userlist} );
  }

  @SubscribeMessage("LeaveChannel")
  async leaveChannel(client: Socket, payload: { id: string, username: string}) {
    const { id, username } = payload;
    await this.channelsService.rmUserFromChannel(id, username);
  }

  @SubscribeMessage("SetAdmin")
  async setAdmin(client: Socket, payload: { id: string, username: string}) {
    const { id, username } = payload;
    await this.channelsService.setAdmin(id, username);
  }

  @SubscribeMessage("RemoveAdmin")
  async removeAdmin(client: Socket, payload: { id: string, username: string}) {
    const { id, username } = payload;
    await this.channelsService.rmAdmin(id, username);
  }

  @SubscribeMessage("GetLastSeen")
  async getLastSeen(client: Socket, payload: { channelId: string}) {
    const { channelId } = payload;
    const lastSeen = await this.channelsService.getLastSeen(channelId);
    client.emit('LastSeen', lastSeen);
  }
  @SubscribeMessage("ReceiveUserChannels")
  async receiveUserChannels(client: Socket, payload: { username: string }) {
    const channels = await this.channelsService.getUserChannels(payload.username);
    this.server.emit('UserChannelList', {channels} );
  }

  @SubscribeMessage('CreateNewChannel')
  async createNewChannel(client: Socket, payload: { channelName: string, users: string[], creator: string, groupType: string, password: string }) {
    const { channelName, users, creator, groupType, password } = payload;
    const newChannel = await this.channelsService.createNewChannel(channelName, users, creator, groupType, password);
    this.server.emit('CreatedNewPublicChannel', {channel: {...newChannel, isGroup:true}});
  }

  @SubscribeMessage('ChannelMsg')
  async handleChannelMsg(client: Socket, payload: { sender: string, channel: string, message: string }) {
    const { sender, channel, message } = payload;
    const { channelId } = await this.channelsService.createChannelMessage(channel, message, sender);
    ///TO DO: creare room a cui mandarlo
    //this.server.to(/*id della room*/).emit('MsgFromChannel', { sender: sender, channel: channel, message: message });
    this.server.emit('MsgFromChannel', [{ user: sender,  msg: message, channelId }]);
  }

  @SubscribeMessage('LastSeen')
  async handleLastSeen(client: Socket, payload: { channelId: string, user: string }) {
    const { channelId, user } = payload;
    await this.channelsService.flagLastMessage(channelId, user);
  }

  @SubscribeMessage('ChangeUserStatus')
  async handleChangeUserStatus(client: Socket, payload: { channelId: string, username: string, status: string | null}) {
    const { channelId, username, status } = payload;
    await this.channelsService.changeUserStatus(channelId, username, status);
  }


  @SubscribeMessage('ReceiveChMsg')
  async receiveChannelMsg(client: Socket, payload: { id: string}) {
    const { id } = payload;
    const messages = await this.channelsService.getChannelMsgById(id);
    ///TO DO: creare room della chat o mandarlo all'id dell'user nella map
    client.emit('ReceiveMsgForChannel', messages.map(message=>{
        return {
          msg:message.content,
          user:message.sender.username,
        }
      })
    );
  }
}