import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../shared/services/auth.service';

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
    private router: Router
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
    const password =  signinForm.value.password;
    this.authService.signIn(email, password).subscribe(() => {      
      this.errorMsgOnSubmit = null;
      this.router.navigate(['/files']);
      this.isLoading = false;
    }, error => {      
      this.errorMsgOnSubmit = error; 
      this.isLoading = false;
    });
  }

}
