import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { UserService } from 'src/app/core/services/user.service';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  user!: string;
  screenW: any;

  @Output() openChat = new EventEmitter();

  constructor(private readonly userService: UserService) {}

  ngOnInit(): void {
    this.user =
      this.userService.getUser() === ''
        ? 'PROFILE'
        : this.userService.getUser();
    this.screenW = window.innerWidth;
  }

  onChatClick() {
    this.openChat.emit();
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.screenW = window.innerWidth;
  }
}
