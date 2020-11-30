import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/storage';
import * as firebase from 'firebase/app';

import { FirestoreService } from './shared/services/firebase.service';
import { File } from './shared/models/file.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: []
})
export class AppComponent implements OnInit {
  title = 'file-uploader';
  filesUploadForm: FormGroup;
  files: File[] = [];
  filesNames: any = [];
  fileURLs: any = [];
  uploadedFiles: File[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private angularFireStorage: AngularFireStorage,
    private firestore: FirestoreService
  ){}

  ngOnInit() {
    this.filesUploadForm = this.formBuilder.group({
      files: new FormControl(null, Validators.required)
    });

    this.firestore.getFiles().subscribe(files => {

    })

    this.firestore.getFiles().subscribe(files => {
      this.uploadedFiles = files.map(e => {
        return {
          id: e.payload.doc.id,
          ...e.payload.doc.data() as File
        }
      })
    });
  }

  uploadFiles(event) {
    for (let i = 0; i < event.target.files.length; i++){
      this.files.push(event.target.files[i]);
      this.filesNames.push(this.files[i].name);
    } 
  }

  uploadFilesToFirestore() {
    return new Promise((resolve) => {
      if(this.files.length == 0) {
        this.filesUploadForm.value.files = this.fileURLs;
        resolve();
      }
      for (let i = 0; i < this.files.length; i++) {
        this.angularFireStorage.upload(
          "/files/" +
          this.filesNames[i], this.files[i])
        .then(uploadTask => {
          uploadTask.ref.getDownloadURL()
          .then(url => {
            this.fileURLs.push(url);
            if (this.fileURLs.length == this.filesNames.length) {
              this.filesUploadForm.value.files = this.fileURLs;
              resolve();
            }
          })
        });
      }      
    })
  }

  onSubmit(filesUploadForm) {
    if (!filesUploadForm.valid) {
      return
    }

    // this.isLoading = true;

    this.uploadFilesToFirestore().then(() => {
      for (let i = 0; i < this.files.length; i ++){
        const name = this.files[i].name;
        const size = this.files[i].size;
        const date = firebase.default.firestore.Timestamp.now();
        const url = this.fileURLs[i];

        const file = { name, size, date, url};
        this.firestore.uploadFiles(file)
        .then(() => {
          // this.isLoading = false;
          if (i == this.files.length-1) {
            this.filesUploadForm.reset();
            this.files = [];
            this.filesNames = [];
            this.fileURLs = [];
          } 
        })       
      } 
    })  
  }

  deleteLink(url, id) {
    this.firestore.deleteFile(url);
    this.firestore.deleteFileInfo(id);    
  }
}