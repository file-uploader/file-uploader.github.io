import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { throwError, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import * as firebase from 'firebase/app';

import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';

export interface AuthRess {
  idToken: string,
  email: string,
  refreshToken: string,
  expiresIn: string,
  localId: string,
  registered?: boolean
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  user = new BehaviorSubject<User>(null);
  tokenExpTimer;

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  signIn(email: string, password: string) {
    return this.http.post<AuthRess>('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + environment.firebaseConfig.apiKey,
      {
        email: email,
        password: password,
        returnSecureToken: true
      }).pipe(
        catchError(this.errorHandler),
        tap(ressData => {
          this.handleAuth(ressData.email, ressData.localId, ressData.idToken, +ressData.expiresIn);
        }));
  }

  logout() {
    this.user.next(null);
    localStorage.removeItem('userData');
    this.router.navigate(['login'])
    if (this.tokenExpTimer) {
      clearTimeout(this.tokenExpTimer);
    }
    this.tokenExpTimer = null;
  }

  autoLogin() {
    const userData: {
      email: string,
      id: string,
      _tokenId: string,
      _tokenExpTime: string
    } = JSON.parse(localStorage.getItem('userData'));
    if (!userData) {
      return;
    }
    const loadedUser = new User(
      userData.email,
      userData.id,
      userData._tokenId,
      new Date(userData._tokenExpTime)
    )
    if (loadedUser.token) {
      this.user.next(loadedUser);
      const expDuration = new Date(userData._tokenExpTime).getTime() - new Date().getTime();
      this.autoLogout(expDuration)
    }
  }

  autoLogout(expDuration: number) {
    this.tokenExpTimer = setTimeout(() => {
      this.logout();
    }, expDuration)
  }

  private errorHandler(errorRess: HttpErrorResponse) {
    let errorMsg = 'Unknown Error!';
    if (!errorRess.error || !errorRess.error.error) {
      return throwError(errorMsg);
    } else {
      switch (errorRess.error.error.message) {
        case 'EMAIL_EXISTS': errorMsg = 'Already has a registration with this email!';
          break;
        case 'EMAIL_NOT_FOUND': errorMsg = 'Wrong email or password!';
          break;
        case 'INVALID_PASSWORD': errorMsg = 'Wrong email or password!';
      }
      return throwError(errorMsg);
    }
  }

  private handleAuth(email: string, id: string, tokenId: string, tokenExpIn: number) {
    const tokenExpTime = new Date(new Date().getTime() + tokenExpIn * 1000);
    const user = new User(email, id, tokenId, tokenExpTime);
    this.user.next(user);
    this.autoLogout(tokenExpIn * 1000);
    localStorage.setItem('userData', JSON.stringify(user));
  }
}