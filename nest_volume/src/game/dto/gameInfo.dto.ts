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

export const START_GAME_DATA: GameInfo = {
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
	racket1Increment: 0
}