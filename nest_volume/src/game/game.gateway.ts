import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
import { GameInfo, START_GAME_DATA } from './dto/gameInfo.dto';
import { log } from 'console';
  
  @WebSocketGateway({
	namespace: '/pong',
	cors: {
	  origin: '*',
	  credentials: true,
	},
  })
  export class PongGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	server: Server;
	queue: Socket[] = [];
	rooms: {name: string; data: GameInfo}[] = [];

  
	afterInit(server: Server) {
	  console.log('\n\nInitialized!(pong)');
	}
  
	handleConnection(client: Socket) {
		this.queue.push(client);
		console.log(`\n\nClient connected(pong): ${client.id}`);
		this.matchmake();
	}

	handleDisconnect(client: Socket) {
		console.log(`\n\nClient disconnected(pong): ${client.id}`);
		this.removeFromQueue(client);
	  }
	
	private removeFromQueue(client: Socket) {
	this.queue = this.queue.filter((c) => c.id !== client.id);
	}

	private matchmake() {
	// Implement your matchmaking logic here
	if (this.queue.length >= 2) {
		const player1 = this.queue.pop();
		const player2 = this.queue.pop();

		// Create a room for the matched players
		let roomName = `room_${Math.random().toString(36).substring(2, 8)}`;
		player1?.join(roomName);
		player2?.join(roomName);
		this.rooms.push({name: roomName, data: START_GAME_DATA});

		// Notify players about the match

		//this.server.to(roomName).emit('match-found', { room: roomName });
		console.log(`\n\nMatch found! Players ${player1?.id} and ${player2?.id} are in room ${roomName}`);
	//	player1?.emit('opponent-found', {user: player2, connected: true});
	//	player2?.emit('opponent-found', {user: player1, connected: true});
	}
	}
  
	
	
	@SubscribeMessage('checkOpponent')
	async handleCheckOpponent(client: Socket, callback: Function): Promise<void> {
		// Check if there is an opponent connected
		console.log('Received checkOpponent event');
		const rooms = client.rooms;
	
		if (rooms.size > 0) {
			for (const roomName of rooms) {
				console.log('Room Name:', roomName);
		  
				const socketsInRoom = await this.server.in(roomName).fetchSockets();
		  
	        if (socketsInRoom.length > 1) {
				// There is at least one more socket in the room (opponent)
				const opponentId = socketsInRoom.find(socket => socket.id !== client.id)?.id;
				const opponentInfo = { user: { id: opponentId, name: 'opponentName' }, connected: true };
	
				// Send the opponent information to the client
				console.log(opponentInfo);
				callback(opponentInfo);
				return;
			}
			}
		}
	
		// If the client is not in any room or there's no opponent, you can handle it accordingly
		console.log('Client is not in any room or no opponent found');
		callback(null);
	    // // Check if there is an opponent connected
		// console.log('Received checkOpponent event');
		// const roomName = Object.keys(client.rooms)[1]; // Get the room name (assuming the socket is in only one room)
		// console.log(roomName);
		// if (roomName) {
			// 	console.log('Found roomName');
			// 	const socketsInRoom = this.server.sockets.adapter.rooms.get(roomName);
			
			// 	if (socketsInRoom && socketsInRoom.size > 1) {
				// 	// There is at least one more socket in the room (opponent)
				// 	const opponentId = [...socketsInRoom].find(socketId => socketId !== client.id);
				// 	const opponentInfo = { user: { id: opponentId, name: 'opponentName' }, connected: true };
				
				// 	// Send the opponent information to the client
				// 	console.log(opponentInfo);
		// 	callback(opponentInfo);
		// 	return;
		// 	}
		// }
	}


	@SubscribeMessage('moveRacket')
	handleMoveRacket(client: Socket, payload: {game: any ; direction: string }): void {
	  // Handle the moveRacket event here
	  // Example: Update the game state and broadcast the updated state to all clients
	  // You'll need to implement your own game logic
	  if (payload.direction === "up"){
	
	  }
	  else if (payload.direction === "down"){
  
	  }
	  console.log(`\n\nReceived moveRacket event from ${client.id}: ${payload.direction}`);
	  // Update the game state based on the direction
		
	  // Broadcast the updated game state to all clients
	  this.server.emit('game-update', payload.game);
	}
  
	@SubscribeMessage('game-connect')
	handleGameConnect(client: Socket, user: { id: string; name: string }): void {
	  // Handle the game-connect event here
	  // Example: You can log the connected user or perform other actions
	  client.join(user.id);

	  console.log(`\n\n${user.name} connected to the game`);
	}
  }
  