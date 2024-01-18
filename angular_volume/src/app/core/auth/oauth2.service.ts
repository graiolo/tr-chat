import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import * as dotenv from 'dotenv';

@Injectable({
  providedIn: 'root',
})
export class OAuth2Service {
  constructor(private http: HttpClient) {}

  redirectUser(link: string) {
    window.location.href = link;
  }

  async codeForAccessToken(code: string): Promise<any> {
    return lastValueFrom(this.http.post('/nest/auth/42', { code }));
  }
}
