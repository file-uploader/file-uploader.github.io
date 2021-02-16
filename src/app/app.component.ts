import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { AuthService } from './shared/services/auth.service';
import { SubjectsService } from './shared/services/subjects.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: []
})
export class AppComponent implements OnInit, OnDestroy {
  private subUser: Subscription;
  isAuth: boolean = false;
  enableLoginReportSub: Subscription;
  enableLoginReport: boolean;

  constructor(
    private authService: AuthService,
    private subjects: SubjectsService
  ) {}

  ngOnInit() {
    this.subUser = this.authService.user.subscribe(user => {
      this.isAuth = !user ? false : true;
    });

    this.authService.autoLogin(); 
    
    this.enableLoginReportSub = this.subjects.enableLoginReportSubject.subscribe(data => {
      this.enableLoginReport = data;
    })
  }

  ngOnDestroy() {
    this.subUser.unsubscribe();
  }
}