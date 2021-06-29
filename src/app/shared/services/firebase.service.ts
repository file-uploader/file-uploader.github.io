import { Injectable } from '@angular/core';
import { AngularFirestore  } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { BehaviorSubject } from 'rxjs';

import { File } from '../models/file.model';
import { LoginReport, UserAdditionalInfo } from '../models/user.model';

@Injectable({providedIn: 'root'})
export class FirestoreService {
  users: UserAdditionalInfo[] = [];
  usersSubject = new BehaviorSubject<UserAdditionalInfo[]>(null);

  lastLogins: LoginReport[] = [];
  lastLoginsSubject = new BehaviorSubject<LoginReport[]>(null);

  failedLogins: LoginReport[] = [];
  failedLoginsSubject = new BehaviorSubject<LoginReport[]>(null);

  loginReportCount: number = 10;
  loginReportCountSubject = new BehaviorSubject<number>(null);
  
  constructor(
    private firestore: AngularFirestore,
    private storage: AngularFireStorage
  ) {
    this.loginReportCountSubject.next(this.loginReportCount)
  }

  uploadFiles(file: File){
    return this.firestore.collection('files').add(file);
  }

  getFiles() {
    return this.firestore
    .collection('files', data => data.orderBy('date', 'desc'))
    .snapshotChanges();
  }

  deleteFile(url) {
    return this.storage.storage.refFromURL(url).delete();
  }

  deleteFileInfo(id){
    return this.firestore.collection('files').doc(id).delete();
  }

  getUser(email: string) {
    return this.firestore
    .collection('users', data => data.where('email', '==', email))
    .snapshotChanges();
  }

  updateUser(newInfo){
    return this.firestore.doc('users/' + newInfo.userId).update({
      confirmDelete: newInfo.isChecked
     });
   }

   getUsers() {
    return this.firestore
    .collection('users', data => data.orderBy('email', 'asc'))
    .snapshotChanges()
    .subscribe(user => {
      this.users = user.map(e => {
        return {
          id: e.payload.doc.id,
          ...e.payload.doc.data() as UserAdditionalInfo
        }   
      });
      this.usersSubject.next(this.users);
    });
  }

  postLastLogins(user: LoginReport){
    return this.firestore.collection('lastLogins').add(user);
  }

  getLastLogins() {
    return this.firestore
    .collection('lastLogins', data => data.orderBy('date', 'desc'))
    .snapshotChanges()
    .subscribe(user => {
      this.lastLogins = user.map(e => {
        return {
          id: e.payload.doc.id,
          ...e.payload.doc.data() as LoginReport
        }   
      })
      this.lastLoginsSubject.next(this.lastLogins);
      if (this.lastLogins.length > this.loginReportCount) {
        const id = this.lastLogins[this.loginReportCount].id;
        this.deleteLastLogins(id);
      }
    });
  }

  getFailedLogins() {
    return this.firestore
    .collection('failedLogins', data => data.orderBy('date', 'desc'))
    .snapshotChanges()
    .subscribe(user => {
      this.failedLogins = user.map(e => {
        return {
          id: e.payload.doc.id,
          ...e.payload.doc.data() as LoginReport
        }   
      })
      this.failedLoginsSubject.next(this.failedLogins);
      if (this.failedLogins.length > this.loginReportCount) {
        const id = this.failedLogins[this.loginReportCount].id;
        this.deleteFailedLogins(id);
      }
    });
  }

  deleteLastLogins(loginId){
    return this.firestore.doc('lastLogins/' + loginId).delete();
   }

  postFailedLogins(user: LoginReport){
    return this.firestore.collection('failedLogins').add(user);
  }

  deleteFailedLogins(loginId){
    return this.firestore.doc('failedLogins/' + loginId).delete();
   }
}