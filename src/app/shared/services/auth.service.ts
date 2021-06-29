import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';

import { User } from '../models/user.model';
import { FirestoreService } from './firebase.service';
import { SubjectsService } from './subjects.service';

@Injectable({providedIn: 'root'})
export class AuthService{
  user = new BehaviorSubject<User>(null!);
  authStateSubscription!: Subscription;

  constructor(
    private _router: Router,
    private _firebaseAuth: AngularFireAuth,
    private _firestore: FirestoreService,
    private _subjects: SubjectsService
  ){}

  signIn(email: string, password: string){
    this._subjects.loading();

    const userEmail = email!;
    const date = firebase.default.firestore.Timestamp.now();
    const loggedUser = {userEmail, date}

    this._firebaseAuth.signInWithEmailAndPassword(email, password)
    .then(user => {
      this._subjects.notLoading();
      this.handleAuth(user.user?.email!, user.user?.uid!, user.user?.refreshToken!);
      this._router.navigate(['/files']);
      this._subjects.clearError();
      this._firestore.postLastLogins(loggedUser);
    }, error => {
      this._subjects.notLoading();
      this.errorHandler(error);
      this._firestore.postFailedLogins(loggedUser);
    })
  }

  logout(){
    this._firebaseAuth.signOut().then(() => {
      this.user.next(null!);
      localStorage.removeItem('userData');
      this._router.navigate(['/login']);
    });
    this._subjects.closeLoginRerport();
  }

  autoLogin(){
    const userData: {
      email: string,
      id: string,
      refreshToken: string,
    } = JSON.parse(localStorage.getItem('userData')!);

    if(!userData){     
      return;
    }
    
    const loadedUser = new User(
      userData.email,
      userData.id,
      userData.refreshToken
    )

    this.handleAuth(loadedUser.email, loadedUser.id, loadedUser.refreshToken);
   
    this.authStateSubscription = this._firebaseAuth.authState.subscribe(user => {
      if(user?.email !== loadedUser.email || user.uid !== loadedUser.id || user.refreshToken !== loadedUser.refreshToken) {
        this.logout();
        this.authStateSubscription.unsubscribe();
      }
    })
  }

  errorHandler(error: any){
    let errorMsg: string = '';
    switch(error.code){
      case 'auth/email-already-exists': {
        errorMsg = 'Already has a registration with this email!';
        this._subjects.setError(errorMsg);
        break;
      }
      case 'auth/user-not-found': {
        errorMsg = 'Wrong email or password!';
        this._subjects.setError(errorMsg);
        break;
      }
      case 'auth/wrong-password': {
        errorMsg = 'Wrong email or password!';
        this._subjects.setError(errorMsg);
        break;
      }
      default: {
        errorMsg = 'Unknown Error';
        this._subjects.setError(errorMsg);
        break
      }      
    }
  }

  handleAuth(email:string, id: string, refreshToken: string){
    const user = new User(email, id, refreshToken);
    this.user.next(user);
    localStorage.setItem('userData', JSON.stringify(user));
  }
}