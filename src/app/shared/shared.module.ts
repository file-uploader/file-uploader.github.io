import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';
import { MbPipe } from './pipes/mb.pipe';

@NgModule({
	declarations: [
		LoadingSpinnerComponent,
		MbPipe
	],
	imports: [
		CommonModule
	],
	exports: [
		LoadingSpinnerComponent,
		MbPipe
	]
})
export class SharedModule{}