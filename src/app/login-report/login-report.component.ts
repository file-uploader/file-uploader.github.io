import { Component, OnDestroy, OnInit } from '@angular/core';

import { FirestoreService } from '../shared/services/firebase.service';
import { UserAdditionalInfo, LoginReport } from '../shared/models/user.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login-report',
  templateUrl: './login-report.component.html',
  styles: [
  ]
})
export class LoginReportComponent implements OnInit {
  users: UserAdditionalInfo[] = [];
  lastLogins: LoginReport[] = [];
  failedLogins: LoginReport[] = [];
  loginReportCount: number = 10;


  constructor(
    private firestore: FirestoreService    
  ) { }

  ngOnInit(): void {
    this.firestore.getUsers().subscribe(user => {
      this.users = user.map(e => {
        return {
          id: e.payload.doc.id,
          ...e.payload.doc.data() as UserAdditionalInfo
        }   
      })
    })

    this.firestore.getLastLogins().subscribe(user => {
      this.lastLogins = user.map(e => {
        return {
          id: e.payload.doc.id,
          ...e.payload.doc.data() as LoginReport
        }   
      })
      if (this.lastLogins.length > this.loginReportCount) {
        const id = this.lastLogins[this.loginReportCount].id;
        this.firestore.deleteLastLogins(id);
      }
    })

    this.firestore.getFailedLogins().subscribe(user => {
      this.failedLogins = user.map(e => {
        return {
          id: e.payload.doc.id,
          ...e.payload.doc.data() as LoginReport
        }   
      })
      if (this.failedLogins.length > this.loginReportCount) {
        const id = this.failedLogins[this.loginReportCount].id;
        this.firestore.deleteFailedLogins(id);
      }
    })
  }
}
