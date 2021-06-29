import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { AuthService } from '../shared/services/auth.service';
import { SubjectsService } from '../shared/services/subjects.service';

@Component({
  selector: 'app-sign-form',
  templateUrl: './sign-form.component.html',
  styles: [
  ]
})
export class SignFormComponent implements OnInit, OnDestroy {
  signinForm: FormGroup;
  errorMsgSubscription: Subscription;
  errorMsg: string = '';
  isLoadingSubscription: Subscription;
  isLoading: boolean;

  constructor(
    private _authService: AuthService,
    private _subjects: SubjectsService
  ) {}

  ngOnInit() {
    this.signinForm = new FormGroup({
      email: new FormControl (null , [Validators.required, Validators.email]),
      password: new FormControl (null , [Validators.required, Validators.minLength(8), Validators.maxLength(30)]),
    });

    this.errorMsgSubscription = this._subjects.errorMsgSubject.subscribe(error => {
      this.errorMsg = error;
    });

    this.isLoadingSubscription = this._subjects.isLoadingSubject.subscribe(boolean => {
      this.isLoading = boolean;
    });
  }

  ngOnDestroy() {
    this.errorMsgSubscription.unsubscribe();
    this.isLoadingSubscription.unsubscribe();
  }

  onSubmit(signinForm){
    const email = signinForm.value.email;
    const password =  signinForm.value.password;
    this._authService.signIn(email, password);
  }
}
