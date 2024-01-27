import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.css'],
})
export class LeaderboardComponent implements OnInit {
  players: any;

  constructor(
    private readonly userService: UserService,
    private readonly router: Router
  ) {}

  async ngOnInit() {
    this.players = (await this.userService.getAllUsers()).sort(
      (a: any, b: any) => {
        const aWinRatio = a.Wins / (a.Wins + a.Losses);
        const bWinRatio = b.Wins / (b.Wins + b.Losses);
        return bWinRatio - aWinRatio;
      }
    );
  }

  openProfile(player: string) {
    this.router.navigate(['/transcendence/profile', player]);
  }
}
