import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GoogleAuthService {
  constructor(private http: HttpClient) {}

  async validate2fa(id: string, token: string): Promise<any> {
    return lastValueFrom(
      this.http.post(`/nest/auth/2fa-validate/`, { userId: id, token: token })
    );
  }

  async getLink(id: string): Promise<any> {
    return lastValueFrom(
      this.http.post(`/nest/users/2fa-generate/`, { userId: id })
    );
  }
}
