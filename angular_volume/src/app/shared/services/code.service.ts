import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CodeService {
  constructor() {}

  private codeSubject = new BehaviorSubject<string>('');

  code$ = this.codeSubject.asObservable();

  setCode(code: string) {
    this.codeSubject.next(code);
  }

  emitCode(): Promise<string> {
    return new Promise<string>((resolve) =>
      this.code$.subscribe((code) => {
        if (code) {
          resolve(code);
        }
      })
    );
  }
}
