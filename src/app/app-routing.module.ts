import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FilesComponent } from './files/files.component';
import { SignFormComponent } from './sign-form/sign-form.component';

import { AuthGuardIn } from './shared/services/authIn.guard.service';
import { AuthGuardOut } from './shared/services/authOut.guard.service';

const routes: Routes = [
  {path: '', redirectTo: 'files', pathMatch: 'full'},
  {path: 'files', component: FilesComponent, canActivate: [AuthGuardIn]},
  {path: 'login', component: SignFormComponent, canActivate: [AuthGuardOut]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
