import { AfterViewInit, Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appChangeImage]',
})
export class ChangeImageDirective implements AfterViewInit {
  private changeText: any;
  private imageSpace: any;

  constructor() {}

  ngAfterViewInit(): void {
    this.changeText = document.querySelector('#text');
    this.imageSpace = document.querySelector('#image');
  }

  @HostListener('mouseenter') onMouseEnter() {
    this.changeStyle('20px');
    this.changeTextVisibility('block');
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.changeStyle('0px');
    this.changeTextVisibility('none');
  }

  changeStyle(blurLevel: string) {
    this.imageSpace.style.filter = `blur(${blurLevel})`;
  }

  changeTextVisibility(displayValue: string) {
    this.changeText.style.display = displayValue;
  }
}
