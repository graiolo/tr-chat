import { Component, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-password',
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: PasswordComponent,
      multi: true,
    },
  ],
})
export class PasswordComponent implements ControlValueAccessor {
  showPassword: boolean;
  password: string;

  @Input() placeholder!: string;

  constructor() {
    this.showPassword = false;
    this.password = '';
  }

  onPasswordChange(newPassword: string) {
    this.password = newPassword;
    this.onChange(this.password);
  }

  onChange = (_: any) => {};
  onTouched = () => {};

  writeValue(obj: any): void {
    this.password = obj;
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
