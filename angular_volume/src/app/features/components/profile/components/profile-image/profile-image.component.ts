import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { NgxImageCompressService } from 'ngx-image-compress';
import { UserService } from 'src/app/core/services/user.service';
import { UserInfo } from 'src/app/models/userInfo.model';

@Component({
  selector: 'app-profile-image',
  templateUrl: './profile-image.component.html',
  styleUrls: ['./profile-image.component.css'],
})
export class ProfileImageComponent implements OnInit{
  @Input() conversation: any;
  @Input() user!: UserInfo;
  @Input() currentUser!: boolean;

  constructor(
    private readonly imageCompress: NgxImageCompressService,
    private readonly userService: UserService
  ) {
    
  }
  // FOR IMAGE CHANGE
  @ViewChild('fileInput') fileInput!: ElementRef;

  ngOnInit(): void {
    //console.log(this.conversation);
  }
  // SELECT NEW FILE, COMPRESS IMAGE BASE64 AND PATCH USER IMG
  onFileSelected(event: Event) {
    this.fileInput.nativeElement.click();
    const inputElement = event.target as HTMLInputElement;
    const file = inputElement?.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const profileImage = e.target?.result as string;
        await this.imageCompress
          .compressFile(profileImage, -1, 50, 50)
          .then(async (result) => {
            this.user.img = result;
            await this.userService.setUserAvatar(this.user.id, this.user.img);
          })
          .catch(() => alert('IMAGE LOADING FAILED. TRY AGAIN'));
      };
      reader.readAsDataURL(file);
    }
  }
}
