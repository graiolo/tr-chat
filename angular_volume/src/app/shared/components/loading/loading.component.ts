import { Component, OnInit } from '@angular/core';
import { LoaderService } from '../../services/loader.service';
import { SpeedTestService } from 'ng-speed-test';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.css'],
})
export class LoadingComponent implements OnInit {
  block: boolean;

  constructor(
    private readonly loader: LoaderService,
    private readonly speedTestService: SpeedTestService
  ) {
    this.block = true;
  }

  ngOnInit() {
    this.speedTestService
      .getMbps({
        file: {
          path: '/assets/Google.svg.png',
          shouldBustCache: true,
          size: 68976,
        },
      })
      .subscribe((speed) => {
        if (speed < 1) {
          this.block = false;
        }
      });
  }

  checkStatus(): Boolean {
    return this.loader.getStatus();
  }
}
