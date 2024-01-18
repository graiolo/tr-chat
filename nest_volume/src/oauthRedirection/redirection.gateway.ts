import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { environment } from 'src/environment/environment';

@WebSocketGateway({
  namespace: '/redirection',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class RedirectionGateway {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket, ...args: any[]) {
    console.log(`\n\nRedirection gateway: ${client.id}\n\n`);//for debug
  }

  @SubscribeMessage('messageRequest')
  handleMessage(client: any, payload: any): void {
    const message = environment.ft_api_url;
    this.server.emit('textMessage', { message });
  }
}
