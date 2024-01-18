import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable, finalize } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { LoaderService } from 'src/app/shared/services/loader.service';

@Injectable()
export class HeaderInterceptor implements HttpInterceptor {
  private requestNumber: number;

  constructor(
    private readonly auth: AuthService,
    private loader: LoaderService
  ) {
    this.requestNumber = 0;
  }

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const modifiedRequest = request.clone({
      setHeaders: {
        'Content-Type': 'application/json',
        accept: 'application/json',
        Authorization: `Bearer ${this.auth.getToken()}`,
      },
    });
    this.requestNumber++;
    this.loader.setStatus(true);
    return next.handle(modifiedRequest).pipe(
      finalize(() => {
        this.requestNumber--;
        if (this.requestNumber === 0) {
          this.loader.setStatus(false);
        }
      })
    );
  }
}
