import { Injectable } from '@angular/core';
import { AngularFirestore  } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';

import { File } from '../models/file.model';
import { LoginReport } from '../models/user.model';

@Injectable({providedIn: 'root'})
export class FirestoreService {
  constructor(
    private firestore: AngularFirestore,
    private storage: AngularFireStorage
  ) {}

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
    .snapshotChanges();
  }

  postLastLogins(user: LoginReport){
    return this.firestore.collection('lastLogins').add(user);
  }

  getLastLogins() {
    return this.firestore
    .collection('lastLogins', data => data.orderBy('date', 'desc'))
    .snapshotChanges();
  }

  deleteLastLogins(loginId){
    return this.firestore.doc('lastLogins/' + loginId).delete();
   }

  postFailedLogins(user: LoginReport){
    return this.firestore.collection('failedLogins').add(user);
  }

  getFailedLogins() {
    return this.firestore
    .collection('failedLogins', data => data.orderBy('date', 'desc'))
    .snapshotChanges();
  }

  deleteFailedLogins(loginId){
    return this.firestore.doc('failedLogins/' + loginId).delete();
   }
}