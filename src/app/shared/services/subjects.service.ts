import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({providedIn: 'root'})
export class SubjectsService {
	enableLoginReportSubject = new BehaviorSubject <boolean>(null);
	enableLoginReport: boolean = false;

  constructor() {
		this.enableLoginReportSubject.next(this.enableLoginReport);
	}
}