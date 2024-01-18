// import { gameInfo } from './gameInfo.dto';
import { Racket, START_RACKET_DATA } from './racket.dto';
import { Ball, START_BALL_DATA } from "./ball.dto";

export interface GameInfo{
	ball: Ball;
	player: Racket;
	opponent: Racket;
	score0: number;
	score1: number;
	p0Y: number;
	p1Y: number;
	p0X: number;
	p1X: number;
	ballX: number;
	ballY: number;
	canMoveBall: boolean;
	canMoveRackets: boolean;
	racket0Increment: number;
	racket1Increment: number;
}

// export const START_GAME_DATA: gameInfo = {
// 	ball: START_BALL_DATA,
// 	player0: START_RACKET_DATA,
// 	player1: START_RACKET_DATA,
// 	score0: 0,
// 	score1: 0,
// 	p0Y: 40,
// 	p1Y: 40,
// 	p0X: player0.margin,
// 	p1X: 100 - player1.margin - player1.width,
// 	ballX: -1 * ball.width,
// 	ballY: -1 * ball.height,
// 	canMoveBall: false,
// 	canMoveRackets: false,
// 	racket0Increment: 0,
// 	racket1Increment: 0
// }