import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { AuthService } from './shared/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: []
})
export class AppComponent implements OnInit, OnDestroy {
  private subUser: Subscription;
  isAuth: boolean = false;

  constructor(
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.subUser = this.authService.user.subscribe(user => {
      this.isAuth = !user ? false : true;
    });

    this.authService.autoLogin();    
  }

  ngOnDestroy() {
    this.subUser.unsubscribe();
  }
}