import { Component, Input, ViewChild, ElementRef} from '@angular/core';
import { FriendsService } from 'src/app/core/services/friends.service';
import { Router } from '@angular/router';
import { NgxImageCompressService } from 'ngx-image-compress';
import { log } from 'console';
import { UserService } from 'src/app/core/services/user.service';
import { UserInfo } from 'src/app/models/userInfo.model';
import { BLOCKED_USER_INFO } from 'src/app/models/userInfo.model'


@Component({
  selector: 'app-user-buttons',
  templateUrl: './user-buttons.component.html',
  styleUrls: ['./user-buttons.component.css'],
})
export class UserButtonsComponent {
  @Input() username!: string;
  @Input() isFriend!: boolean;
  @Input() isBlocked!: boolean;
  @Input() user!: UserInfo;

  constructor(
    private readonly friendsService: FriendsService,
    private readonly router: Router,
    private readonly imageCompress: NgxImageCompressService,
    private readonly userService: UserService
  ) {}

  async addFriend() {
    await this.friendsService
      .addFriend(this.username)
      .then(() => (this.isFriend = true));
  }

  async removeFriend() {
    await this.friendsService
      .deleteFriend(this.username)
      .then(() => (this.isFriend = false));
  }

  async blockUser() {
    await this.friendsService
      .blockUser(this.username)
      .then(() => (this.isBlocked = true));
  }

  async unblockUser() {
    await this.friendsService
      .unblockUser(this.username)
      .then(() => (this.isBlocked = false));
  }

  getBlockedUserImg(): string {
    return BLOCKED_USER_INFO.img || '';
  }
  
  openFriendChat() {
    this.router.navigate(['/transcendence/chat/'], {
      queryParams: { username: this.username },
    });
  }
}
