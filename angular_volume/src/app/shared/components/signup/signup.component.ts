import { Component } from '@angular/core';
import { UserService } from 'src/app/core/services/user.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent {
  signupForm!: FormGroup;
  errorMsg: string;
  showPassword: boolean;
  showConfirm: boolean;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {
    this.errorMsg = '';
    this.showPassword = false;
    this.showConfirm = false;
    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmVisibility() {
    this.showConfirm = !this.showConfirm;
  }

  private isFieldEmpty(field: string): boolean {
    return this.signupForm.get(field)?.hasError('required') || false;
  }

  private isEmailInvalid(): boolean {
    return this.signupForm.get('email')?.hasError('email') || false;
  }

  private isPasswordShort(): boolean {
    return this.signupForm.get('password')?.hasError('minlength') || false;
  }

  private isPasswordMismatch(): boolean {
    return (
      this.signupForm.get('password')?.value !==
      this.signupForm.get('confirmPassword')?.value
    );
  }

  newUser() {
    if (this.isFieldEmpty('username')) {
      this.errorMsg = 'Insert Username';
    } else if (this.isFieldEmpty('email')) {
      this.errorMsg = 'Insert Email';
    } else if (this.isEmailInvalid()) {
      this.errorMsg = 'Insert Valid Email';
    } else if (this.isFieldEmpty('password')) {
      this.errorMsg = 'Insert Password';
    } else if (this.isPasswordShort()) {
      this.errorMsg = 'Password too short (Min length: 6)';
    } else if (this.isFieldEmpty('confirmPassword')) {
      this.errorMsg = 'Insert password again';
    } else if (this.isPasswordMismatch()) {
      this.errorMsg = "Passwords don't match";
    } else {
      this.errorMsg = '';
      this.onSignup(this.signupForm.value);
    }
  }

  private async onSignup(formValue: any) {
    this.userService
      .registerUser({
        username: formValue.username,
        email: formValue.email,
        password: formValue.password,
      })
      .then(() => {
        this.signupForm.reset();
        this.router.navigate(['login']);
      })
      .catch(() => {
        this.errorMsg = `Error. Try again`;
        this.signupForm.reset();
      });
  }
}
