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

  @SubscribeMessage('CreateNewPublicChannel')
  async createNewPublicChannel(client: Socket, payload: { channelName: string, users: string[], creator: string }) {
    const { channelName, users, creator } = payload;
    const newChannel = await this.channelsService.createNewPublicChannel(channelName, users, creator);
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