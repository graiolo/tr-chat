import { Component, Input } from '@angular/core';
import { UserInfo } from 'src/app/models/userInfo.model';
import { GoogleAuthService } from 'src/app/core/auth/google-auth.service';
import { StatusService } from 'src/app/core/services/status.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-two-factor-auth',
  templateUrl: './two-factor-auth.component.html',
  styleUrls: ['./two-factor-auth.component.css'],
})
export class TwoFactorAuthComponent {
  @Input() user!: UserInfo;
  showQr: boolean;
  newQr: boolean;

  constructor(
    private readonly googleAuth: GoogleAuthService,
    private readonly status: StatusService,
    private userService: UserService
  ) {
    this.showQr = false;
    this.newQr = true;
  }

  // CHECK IF USER 2FA ENABLE AND OPEN NEW QR CODE OR LATEST
  async onEnable2FA() {
    this.showQr = true;
    if (this.user.is2faEnabled === false) {
      await this.googleAuth.getLink(this.user.id).then((response) => {
        this.user.qrcode2fa = response.url.qrUrl;
        this.newQr = true;
      });
    } else {
      this.newQr = false;
    }
  }

  async onConfirm2FA() {
    this.showQr = false;
    await this.status.set2fa(this.user.id, true);
    this.userService.updateUser();
  }

  async onReject2FA() {
    this.showQr = false;
    await this.status.set2fa(this.user.id, false);
    this.userService.updateUser();
  }

  closeQr() {
    this.showQr = false;
  }
}
