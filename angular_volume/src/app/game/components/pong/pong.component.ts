import { UserInfo } from '../../../models/userInfo.model';
import { START_RACKET_DATA } from './dto/racket.dto';
import { io } from 'socket.io-client';
import { GameInfo } from './dto/gameInfo.dto';
import {
  Component,
  HostListener,
  OnInit,
  ViewChild,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import { BlobOptions } from 'buffer';
import { START_BALL_DATA } from './dto/ball.dto';
import { UserService } from 'src/app/core/services/user.service';
import { PongGateway } from 'src/app/core/services/game.gateway';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-pong',
  templateUrl: './pong.component.html',
  styleUrls: ['./pong.component.css'],
})
export class PongComponent implements OnInit, OnDestroy {
  game: GameInfo = {
    ball: START_BALL_DATA,
    player: START_RACKET_DATA,
    opponent: START_RACKET_DATA,
    score0: 0,
    score1: 0,
    p0Y: 40,
    p1Y: 40,
    p0X: 3,
    p1X: 100 - 3 - 3,
    ballX: -1 * 3,
    ballY: -1 * 4,
    canMoveBall: false,
    canMoveRackets: false,
    racket0Increment: 0,
    racket1Increment: 0,
  };
  private socket: any;
  user!: UserInfo;
  opponentConnected = false;
  findOpponent!: any;

  constructor(
    private readonly userData: UserService,
    private readonly gate: PongGateway //	private subs: Subscription
  ) {}

  public async ngOnInit() {
    this.user = await this.userData.getUserInfo();
    this.game.player.player = this.user.id;
    // this.socket = io('https://localhost:8080');
    // this.socket.on('game-update', (data: GameInfo) => {this.game = data;})
    // setInterval(this.checkOpponentConnection, 5000);
    //console.log(this.user);

    // ---------------------- New test using PongGateway ------------------------------------------
    // 	this.subs.add(
    // 		this.gate.connectToGame().subscribe()
    // 	)
    // 	this.subs.add(
    // 		this.gate.onGameUpdate().subscribe({
    // 			next: (data) => {
    // 				this.game = data;
    // 			},
    // 			error: (error) => {
    //   				//this.errorMsg = `Error receiving message from channel: ${error.message}`;
    // 			}
    // 		})
    // 	);
    // 	this.subs.add(
    // 		this.gate.checkOpponentConnection().subscribe({
    // 			next: (response) => {
    // 				this.opponentConnected = response.connected;
    // 				this.game.opponent.player = response.user.id;
    // 			},
    // 			error: (error) => {
    // 			  //this.errorMsg = `Error receiving message from user: ${error.message}`;
    // 			},
    // 		})
    // 	)

    this.gate.onGameUpdate().subscribe((data) => {
      this.game = data;
    });

    this.gate.onOpponentFound().subscribe((found) => {
      console.log('opponent found starting game');
      this.game.opponent.player = found.socket.id;
      this.findOpponent = found.connected;
    });
    // this.findOpponent = setInterval(() => {
    // 	this.gate.checkOpponentConnection().subscribe((response) => {
    // 		console.log(response);
    // 		this.opponentConnected = response.connected;
    // 		this.game.opponent.player = response.user.id;
    // 		});
    // }, 5000);
  }

  ngOnDestroy(): void {
    clearInterval(this.findOpponent);
  }

  // Function to check opponent's connection
  // checkOpponentConnection() {
  // 	this.socket.emit('checkOpponent', (response: {user :UserLoggedModel, connected: boolean }) => {
  // 		console.log(response);
  // 		this.opponentConnnected = response.connected;
  // 		this.game.opponent.player = response.user.id;
  // 	});
  // 	if (this.opponentConnnected){
  // 		this.socket.emit('game-connect', this.user);
  // 	}
  // }

  // Function to check opponent's connection
  checkOpponentConnection() {
    this.socket.emit('checkOpponent', (response: boolean) => {
      this.opponentConnected = response;
    });
  }

  // @HostListener('window:keydown', ['$event'])
  // onKeyDown(e: any) {
  //   if (e.code === 'KeyW' || e.code === 'ArrowUp') {
  // 	this.socket.emit('moveRacket', { direction: 'up' });
  //   }
  //   if (e.code === 'KeyS' || e.code === 'ArrowDown') {
  // 	this.socket.emit('moveRacket', { direction: 'down' });
  //   }
  // }s

  // @HostListener('window:keyup', ['$event'])
  // onKeyUp(e: any) {
  //   if (e.code === 'KeyW' || e.code === 'KeyS') {
  //   }
  //   if (e.code === 'ArrowUp' || e.code === 'ArrowDown') {
  //   }
  // }
}
