import {
	Component
  } from '@angular/core';

@Component({
	selector: 'app-user-list',
	templateUrl: './user-list.component.html',
	styleUrls: ['./user-list.component.css'],
})
export class UserListComponent {
	players: any[] = [
		{ name: 'Player 1', showMenu: false },
		{ name: 'Player 2', showMenu: false },
		{ name: 'Player 3', showMenu: false }
	];

	constructor(
	  ) {
		this.players = [
		  { name: 'Player 1', showMenu: false },
		  { name: 'Player 2', showMenu: false },
		  { name: 'Player 3', showMenu: false }
		];
	  }

	togglePlayerMenu(player: any): void {
		this.players.forEach((p) => (p.showMenu = false));
		player.showMenu = !player.showMenu;
	}

	profile(player: any): void {
		console.log('profile:', player.name);
	}
	  
	DM(player: any): void {
		console.log('DM:', player.name);
	}
	
	inviteToGame(player: any): void {
		console.log('inviteToGame:', player.name);
	}
	
	block(player: any): void {
		console.log('block:', player.name);
	}

	mute(player: any): void {
		console.log('mute:', player.name);
	}
	
	kick(player: any): void {
		console.log('kick:', player.name);
	}

	ban(player: any): void {
		console.log('ban:', player.name);
	}

	set_admin(player: any): void {
		console.log('set_admin:', player.name);
	}
}
