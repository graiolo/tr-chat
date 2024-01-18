import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { FriendsService } from 'src/app/core/services/friends.service';

@Component({
  selector: 'app-chat-user',
  templateUrl: './chat-user.component.html',
  styleUrls: ['./chat-user.component.css'],
})
export class ChatUserComponent implements OnInit {
  @Input() conversation!: any;
  @Output() openChat = new EventEmitter<string>();
  user: any = null;

  @HostListener('click') onClick() {
    this.openChat.emit(this.conversation);
  }

  constructor(private readonly friendService: FriendsService) {}

  async ngOnInit() {
    if (!this.conversation.isGroup) {
    this.user = await this.friendService.getFriendInfo(
      this.conversation.name
    );
    }
  }
}
