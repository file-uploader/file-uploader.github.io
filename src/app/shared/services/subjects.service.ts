import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({providedIn: 'root'})
export class SubjectsService {
	enableLoginReport: boolean = false;
	enableLoginReportSubject = new BehaviorSubject <boolean>(null);

  errorMsg: string = '';
	errorMsgSubject = new BehaviorSubject<string>('');

  isLoading: boolean = false;
  isLoadingSubject = new BehaviorSubject<boolean>(null);

  constructor() {
		this.enableLoginReportSubject.next(this.enableLoginReport);
	}

	loading() {
    this.isLoading = true;
    this.isLoadingSubject.next(this.isLoading);
  }

  notLoading() {
    this.isLoading = false;
    this.isLoadingSubject.next(this.isLoading);
  }

	clearError() {
		this.errorMsg = '';
		this.errorMsgSubject.next(this.errorMsg)
	}

	setError(error: string) {
		this.errorMsg = error;
		this.errorMsgSubject.next(this.errorMsg)
	}

	loginRerport() {
		this.enableLoginReport = !this.enableLoginReport;
		this.enableLoginReportSubject.next(this.enableLoginReport);
	}

	closeLoginRerport() {
		this.enableLoginReport = false;
		this.enableLoginReportSubject.next(this.enableLoginReport);
	}
}