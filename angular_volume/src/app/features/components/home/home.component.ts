import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  constructor(private readonly router: Router) {}

  @HostListener('document:keydown.enter', ['$event'])
  enterKeyPressed(event: KeyboardEvent) {
    event.preventDefault();
    this.gameNavigate();
  }

  gameNavigate() {
    this.router.navigate(['/trascendence/pong/']);
  }
}
