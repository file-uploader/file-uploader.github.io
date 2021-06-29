import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { FirestoreService } from '../shared/services/firebase.service';
import { UserAdditionalInfo, LoginReport } from '../shared/models/user.model';

@Component({
  selector: 'app-login-report',
  templateUrl: './login-report.component.html',
  styles: [
  ]
})
export class LoginReportComponent implements OnInit, OnDestroy {
  users: UserAdditionalInfo[];
  usersSubscription: Subscription;

  lastLogins: LoginReport[];
  lastLoginsSubscription: Subscription;

  failedLogins: LoginReport[];
  failedLoginsSubscription: Subscription;

  loginReportCount: number;
  loginReportCountbscription: Subscription;

  constructor(
    private _firestore: FirestoreService,
  ) { }

  ngOnInit(): void {
    this.usersSubscription = this._firestore.usersSubject.subscribe(users => {
      this.users = users;
    });

    this.lastLoginsSubscription = this._firestore.lastLoginsSubject.subscribe(logins => {
      this.lastLogins = logins;
    });

    this.failedLoginsSubscription = this._firestore.failedLoginsSubject.subscribe(logins => {
      this.failedLogins = logins;
    });

    this.loginReportCountbscription = this._firestore.loginReportCountSubject.subscribe(number => {
      this.loginReportCount = number;
    });
  }

  ngOnDestroy() {
    this.usersSubscription.unsubscribe();
    this.lastLoginsSubscription.unsubscribe();
    this.failedLoginsSubscription.unsubscribe();
    this.loginReportCountbscription.unsubscribe();
  }
}
