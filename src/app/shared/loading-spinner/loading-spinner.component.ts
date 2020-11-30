import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  template: `
  <div class="loading-spinner">
    <div class="loader">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  </div>
  `,
  styleUrls: []
})
export class LoadingSpinnerComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
