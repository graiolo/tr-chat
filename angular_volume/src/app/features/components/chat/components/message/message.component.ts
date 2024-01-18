import { Component, Input, OnInit } from '@angular/core';
import { UserService } from '../../../../../core/services/user.service';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css'],
})
export class MessageComponent implements OnInit {
  @Input() message: any;
  username!: string;
  currentUser!: boolean;

  constructor(private readonly userService: UserService) {}

  ngOnInit() {
    this.username = this.message.user;
    if (this.username !== this.userService.getUser()) {
      this.currentUser = false;
    } else {
      this.currentUser = true;
    }
  }
}
