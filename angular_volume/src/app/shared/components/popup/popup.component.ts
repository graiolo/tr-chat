import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CodeService } from '../../services/code.service';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.css'],
})
export class PopupComponent {
  @Input() isOpen!: boolean;
  @Output() isOpenChange = new EventEmitter<boolean>();

  code: string;

  constructor(private readonly codeService: CodeService) {
    this.isOpen = false;
    this.code = '';
  }

  sendCode() {
    this.isOpen = !this.isOpen;
    this.isOpenChange.emit(this.isOpen);
    this.codeService.setCode(this.code);
  }
}
