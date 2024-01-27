import { MessageComponent } from './../message/message.component';
import { AfterViewChecked, Component, ElementRef, HostListener, Input, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ChatGateway } from 'src/app/core/services/chat.gateway';
import { Subscription, skip, take } from 'rxjs';
import { Router } from '@angular/router';
import { FriendsService } from 'src/app/core/services/friends.service';
import { UserInfo } from 'src/app/models/userInfo.model';
import * as path from 'path';


@Component({
	selector: 'app-user-list',
	templateUrl: './user-list.component.html',
	styleUrls: ['./user-list.component.css'],
})
export class UserListComponent implements OnInit, OnDestroy{
	@Input() user!: any;

	private $subs = new Subscription();
	public otherUsers!: UserInfo[];
	public isGroupChat: boolean = true;
	public myRole : string = 'MEMBER';
	public channelId: string = '';

	players: any[] = [];
	attr: any;

	constructor(
		private readonly chatGateway: ChatGateway,
		private readonly router: Router,
		private readonly friendsService: FriendsService,
	  ) {
	  }

	ngOnInit(): void {
		this.userList();
	}

	userList()
	{
		this.$subs.add(
			this.chatGateway.onChannelId().pipe().subscribe({
				next: (data: any) => {
					this.isGroupChat = true;
					if (data.channel.type === 'DIRECT'){
						this.isGroupChat = false;
					}
					this.otherUsers = [];
					this.players = [];
					this.channelId = data.channel.id;
					for (let user of data.channel.members) {
						const username = user.user.username;
						const role = user.role;
						const id = user.user.id;
						const blockList = user.user.blockedBy;
						const banOrKick = user.status;
						let isBlock = false;
						for (let blockUser of blockList) {
							if (blockUser.blocker.username === this.user.username) {
								isBlock = true;
							}
						}
						if (username !== this.user.username && banOrKick !== 'KICKED'){
							this.players.push({ 
									id: id,
									name: username,
									showMenu: false,
									role: role,
									isBlock: isBlock,
									banOrKick: banOrKick
								});
						}
						else {
							this.myRole = role;
						}
					}
					if (this.players.length === 0) {
						this.players.push({ 
							id: '',
							name: 'No users in this channel',
							showMenu: false,
							role: '',
							isBlock: false,
							banOrKick: ''
						});
					}
				},	
			})
		);
	}

	ngOnDestroy(): void {
		this.$subs.unsubscribe();
	}

	togglePlayerMenu(player: any): void {
		this.players.forEach((p) => (p.showMenu = false));
		player.showMenu = !player.showMenu;
	}

	profile(player: any): void {
		console.log('profile:', player.name);
		this.router.navigate(['/transcendence/profile', player.name]);
	}

	DM(player: any): void {
		console.log('DM:', player.name);
	}

	inviteToGame(player: any): void {
		console.log('inviteToGame:', player.name);
	}

	async block(player: any): Promise<void>{
		console.log('block:', player.name);
		await this.friendsService
		.blockUser(player.name)
		.then(() => (player.isBlock = true));
	}

	async unblock(player: any): Promise<void> {
		await this.friendsService
		.unblockUser(player.name)
		.then(() => (player.isBlock = false));
	}

	mute(player: any): void {
		console.log('mute:', player.name);
	}

	kick(player: any): void {
		console.log('kick:', player.name);
		this.chatGateway.changeUserStatus(this.channelId, player.name, 'KICKED');
	}

	ban(player: any): void {
		console.log('ban:', player.name);
		this.chatGateway.changeUserStatus(this.channelId, player.name, 'BANNED');
	}

	unban(player: any): void {
		console.log('ban:', player.name);
		this.chatGateway.changeUserStatus(this.channelId, player.name, null);
	}

	async set_admin(player: any) {
		console.log('set_admin:', player.name);
		this.chatGateway.setAdmin(this.channelId, player.name);
		player.role = 'ADMIN';
	}

	async rm_admin(player: any) {
		console.log('rm_admin:', player.name);
		this.chatGateway.removeAdmin(this.channelId, player.name);
		player.role = 'MEMBER';
	}
}