import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import * as firebase from 'firebase/app';

import { AuthService } from '../shared/services/auth.service';
import { FirestoreService } from '../shared/services/firebase.service';

@Component({
  selector: 'app-sign-form',
  templateUrl: './sign-form.component.html',
  styles: [
  ]
})
export class SignFormComponent implements OnInit {
  signinForm: FormGroup;
  errorMsgOnSubmit: string = null;
  isLoading: boolean = false;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private firestore: FirestoreService,
  ) {}

  ngOnInit() {
    this.signinForm = new FormGroup({
      email: new FormControl (null , [Validators.required, Validators.email]),
      password: new FormControl (null , [Validators.required, Validators.minLength(8), Validators.maxLength(30)]),
    });
  }  

  onSubmit(signinForm){
    this.isLoading = true;
    const email = signinForm.value.email;
    const date = firebase.default.firestore.Timestamp.now();
    const user = { date, email};
    const password =  signinForm.value.password;
    this.authService.signIn(email, password).subscribe(() => {  
      this.errorMsgOnSubmit = null;
      this.router.navigate(['/files']);
      this.isLoading = false;
      this.firestore.postLastLogins(user);
    }, error => {
      this.errorMsgOnSubmit = error; 
      this.isLoading = false;
      this.firestore.postFailedLogins(user);
    });
  }
}
