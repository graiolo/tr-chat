import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class RedirectionGateway {
  private socket;

  constructor() {
    this.socket = io('/redirection', { path: '/socket.io/' });
  }

  sendMessageRequest() {
    this.socket.emit('messageRequest', {});
  }

  onTextMessage() {
    return new Observable((observer) => {
      this.socket.on('textMessage', (data) => {
        observer.next(data.message);
      });
    });
  }
}
