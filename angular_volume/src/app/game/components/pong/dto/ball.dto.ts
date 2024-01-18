export interface Ball{
	width:number;
	height:number;
	position:number[][];
	velocity:number;
	direction:number;
}

export const START_BALL_DATA: Ball = {
	width: 3,
	height: 4,
	position: [[50,50]],
	velocity: 1,
	direction: 1
}