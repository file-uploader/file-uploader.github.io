import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/storage';
import * as firebase from 'firebase/app';

import { FirestoreService } from '../shared/services/firebase.service';
import { File } from '../shared/models/file.model';
import { AuthService } from '../shared/services/auth.service';
import { UserAdditionalInfo } from '../shared/models/user.model';
import { SubjectsService } from '../shared/services/subjects.service';

@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styles: []
})
export class FilesComponent implements OnInit {
  title = 'file-uploader';
  filesUploadForm: FormGroup;
  files: File[] = [];
  filesNames: any = [];
  fileURLs: any = [];
  uploadedFiles: File[] = [];
  isLoading: boolean = true;
  filesSize: number = 0;
  fileId: string = null;
  userAdditionalData: UserAdditionalInfo[];
  confirmBeforeDelete: boolean;
  confirmationPopup: boolean = false;
  currentUrl: string;
  currentId: string;
  enableLoginReport: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private angularFireStorage: AngularFireStorage,
    private firestore: FirestoreService,
    private authService: AuthService,
    private subjects: SubjectsService
  ) { }

  ngOnInit() {
    this.filesUploadForm = this.formBuilder.group({
      files: new FormControl(null, Validators.required)
    });

    this.firestore.getFiles().subscribe(files => {
      this.filesSize = 0;
      this.uploadedFiles = files.map(e => {
        return {
          id: e.payload.doc.id,
          ...e.payload.doc.data() as File
        }
      })
      for (let i = 0; i < this.uploadedFiles.length; i++) {
        this.filesSize += this.uploadedFiles[i].size;
      }
      this.isLoading = false;
    });
      
    const userData: {
      email: string,
      id: string,
      _tokenId: string,
      _tokenExpTime: string
    } = JSON.parse(localStorage.getItem('userData'));
    if (!userData) {
      return;
    }
    this.firestore.getUser(userData.email).subscribe(user => {
      this.userAdditionalData = user.map(e => {
        return {
          id: e.payload.doc.id,
          ...e.payload.doc.data() as UserAdditionalInfo
        }
      })
      this.confirmBeforeDelete = this.userAdditionalData[0].confirmDelete;
    })
  }

  uploadFiles(event) {
    for (let i = 0; i < event.target.files.length; i++) {
      this.files.push(event.target.files[i]);
      this.filesNames.push(event.target.files[i].name);
    }
  }

  uploadFilesToFirestore() {
    return new Promise<void>((resolve) => {
      if (this.files.length == 0) {
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

    this.isLoading = true;

    this.uploadFilesToFirestore().then(() => {
      for (let i = 0; i < this.files.length; i++) {
        const name = this.files[i].name;
        const size = this.files[i].size;
        const date = firebase.default.firestore.Timestamp.now();
        const url = this.fileURLs[i];

        const file = { name, size, date, url };
        this.firestore.uploadFiles(file)
          .then(() => {
            this.isLoading = false;
            if (i == this.files.length - 1) {
              this.filesUploadForm.reset();
              this.files = [];
              this.filesNames = [];
              this.fileURLs = [];
            }
          })
      }
    })
  }

  deleteFile(url, id) {
    this.firestore.deleteFile(url);
    this.firestore.deleteFileInfo(id);
  }

  deleteFileChek(url, id) {
    if (this.confirmBeforeDelete) {
      this.confirmationPopup = true;
      this.currentUrl = url;
      this.currentId = id;
    } else {
      this.deleteFile(url, id)
    }
  }

  confirmationNo (){
    this.confirmationPopup = false;
  }

  confirmationYes() {
    const url = this.currentUrl;
    const id = this.currentId;
    this.deleteFile(url, id);
    this.confirmationPopup = false;
  }

  removeEl(index) {
    this.files.splice(index, 1);
    this.filesNames.splice(index, 1);
  }

  copyFileLink(fileUrl: string, fileId: string) {
    navigator.clipboard.writeText(fileUrl);
    this.fileId = fileId;
  }

  logOut() {
    this.authService.logout();
  }

  confirmDelete(event) {
    const userId = this.userAdditionalData[0].id;
    if (event.target.checked) {
      this.confirmBeforeDelete = true;
      const isChecked = this.confirmBeforeDelete;
      const newInfo = { isChecked, userId }
      this.firestore.updateUser(newInfo);
    } else {
      this.confirmBeforeDelete = false;
      const isChecked = this.confirmBeforeDelete;
      const newInfo = { isChecked, userId }
      this.firestore.updateUser(newInfo);
    }
  }

  onEnableLoginReport() {
    this.enableLoginReport = !this.enableLoginReport;
    this.subjects.enableLoginReportSubject.next(this.enableLoginReport);
  }
}