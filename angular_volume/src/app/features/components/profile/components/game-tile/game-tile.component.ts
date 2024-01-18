import { Component, Input } from '@angular/core';
import { UserService } from '../../../../../core/services/user.service';

@Component({
  selector: 'app-game-tile',
  templateUrl: './game-tile.component.html',
  styleUrls: ['./game-tile.component.css'],
})
export class GameTileComponent {
  @Input() game: any;
  currentUser: string;

  constructor(private readonly userService: UserService) {
    this.currentUser = this.userService.getUser();
  }
}
