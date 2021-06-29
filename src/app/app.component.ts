import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { AuthService } from './shared/services/auth.service';
import { FirestoreService } from './shared/services/firebase.service';
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
    private _authService: AuthService,
    private _subjects: SubjectsService,
    private _firestore: FirestoreService
  ) {}

  ngOnInit() {
    this.subUser = this._authService.user.subscribe(user => {
      this.isAuth = !user ? false : true;
    });

    this._authService.autoLogin(); 
    
    this.enableLoginReportSub = this._subjects.enableLoginReportSubject.subscribe(data => {
      this.enableLoginReport = data;
    });

    this._firestore.getUsers();
    this._firestore.getLastLogins();
    this._firestore.getFailedLogins();
  }

  ngOnDestroy() {
    this.subUser.unsubscribe();
  }
}