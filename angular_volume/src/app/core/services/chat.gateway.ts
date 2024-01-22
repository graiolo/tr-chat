import { UseGuards } from '@nestjs/common';
import { channel } from 'diagnostics_channel';
import { Injectable, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { io } from 'socket.io-client';
import { AuthService } from '../auth/auth.service';
import { Socket } from 'socket.io';
import { DefaultEventsMap } from '@socket.io/component-emitter';
import { UserService } from './user.service';
import { ElementSchemaRegistry } from '@angular/compiler';
import { stringify } from 'querystring';

@Injectable({
  providedIn: 'root',
})
export class ChatGateway {
  private socket;

  constructor(
    private authService:AuthService,
    private readonly userService:UserService
    ) {
    
    //console.log('ChatGateway constructor called');
    const jwt = this.authService.getToken();
    //console.log({ jwt });
    
    this.socket = io('/chat', { 
      path: '/socket.io/',
      auth:{token: jwt}
    });
  }

  changeUserStatus(channelId: string, username: string, status:string | null) {
    this.socket.emit('ChangeUserStatus', { channelId: channelId, username: username, status:status });
  }

  sendLastSeen(id: string, user: string) {
    this.socket.emit('LastSeen', { channelId: id, user: user });
  }

  deleteAllChannels() {
    this.socket.emit('DeleteAllChannels');
  }

  deleteChannel(id: string) {
    this.socket.emit('DeleteChannel', { channelId: id });
  }

  sendChannelMsg(message:string, channel:string) {
    this.socket.emit('ChannelMsg', { sender:this.userService.getUser(), channel:channel, message:message });
  }

  createNewChannel(channelName:string, users:string[], creator:string, groupType:string, password:string) {
    this.socket.emit('CreateNewChannel', { channelName:channelName, users:users, creator:creator, groupType:groupType, password:password});
  }

  onCreatedNewPublicChannel() {
    return new Observable((observer) => {
      this.socket.on('CreatedNewPublicChannel', (data) => {
        observer.next(
          data.channel,
        );
      });
    });
  }

  sendPrivMsg(message:string, receiver:string) {
    this.socket.emit('PrivMsg', { sender:this.userService.getUser(), receiver:receiver, message:message });
  }


  onChannelId() {
    return new Observable((observer) => {
      this.socket.on('Channel', (data) => {
        observer.next(
          data
        );
      });
    });
  }

  onMsgFromChannel() {
    return new Observable((observer) => {
      this.socket.on('MsgFromChannel', (data) => {
        observer.next(
          data
        );
      });
    });
  }
  onReceiveMsgForChannel() {
    return new Observable((observer) => {
      this.socket.on('ReceiveMsgForChannel', (data) => {
        observer.next(
          data
        );
      });
    });
  }

  leaveChannel(id:string, username:string) {
    this.socket.emit('LeaveChannel', { id, username });
  }

  setAdmin(id:string, username:string) {
    console.log('setAdmin', id, username);
    this.socket.emit('SetAdmin', { id, username });
  }

  removeAdmin(id:string, username:string) {
    this.socket.emit('RemoveAdmin', { id, username });
  }

  getChannelById(id:string) {
    this.socket.emit('GetChannelById', { id });
  }

  receivePrivChannelMsg(receiver?:string, id?:string){
    if (receiver)
      this.socket.emit('ReceivePrivMsg', { sender:this.userService.getUser(), receiver:receiver });
    else if (id)
      this.socket.emit('ReceiveChMsg', { id });
  }

  reciveUserList(id:string){
    this.socket.emit('ReceiveUserList', { id });
  }

  receiveUserChannels(username:string){
    this.socket.emit('ReceiveUserChannels', { username });
  }

  onUserList(){
    return new Observable((observer) => {
      this.socket.on('UserList', (data) => {
        observer.next(data);
        console.log('onUserList', data);
      });
    });
  }

  onUserChannelList(){
    return new Observable((observer) => {
      this.socket.on('UserChannelList', (data) => {
        observer.next(data);
      });
    });
  }

  onUserInfos(){
    return new Observable((observer) => {
      this.socket.on('UserInfos', (data) => {
        observer.next(data);
      });
    });
  }
}
