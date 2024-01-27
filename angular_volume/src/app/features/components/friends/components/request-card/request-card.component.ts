import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { FriendsService } from 'src/app/core/services/friends.service';

@Component({
  selector: 'app-request-card',
  templateUrl: './request-card.component.html',
  styleUrls: ['./request-card.component.css'],
})
export class RequestCardComponent implements OnInit {
  @Input() username: string;
  @Output() reload = new EventEmitter<void>();
  profileImage!: string;

  constructor(
    private readonly friendService: FriendsService,
    private readonly router: Router
  ) {
    this.username = '';
  }

  async ngOnInit() {
    await this.friendService
      .getFriendInfo(this.username)
      .then((resp) => {
        this.profileImage = resp.img;
      })
      .catch((err) => console.error(err));
  }

  async onAccept() {
    await this.friendService
      .acceptFriend(this.username)
      .then(() => this.reload.emit());
  }

  async onRefuse() {
    await this.friendService
      .rejectFriend(this.username)
      .then(() => this.reload.emit());
  }

  openProfile() {
    this.router.navigate(['/transcendence/profile', this.username]);
  }
}
