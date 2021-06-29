import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/storage';
import * as firebase from 'firebase/app';

import { FirestoreService } from '../shared/services/firebase.service';
import { File } from '../shared/models/file.model';
import { AuthService } from '../shared/services/auth.service';
import { UserAdditionalInfo } from '../shared/models/user.model';
import { SubjectsService } from '../shared/services/subjects.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styles: []
})
export class FilesComponent implements OnInit, OnDestroy {
  title = 'file-uploader';
  filesUploadForm: FormGroup;
  files: File[] = [];
  filesNames: any = [];
  fileURLs: any = [];
  uploadedFiles: File[] = [];
  isLoading: boolean = false;
  filesSize: number = 0;
  fileId: string = null;
  userAdditionalData: UserAdditionalInfo[];
  confirmBeforeDelete: boolean;
  confirmationPopup: boolean = false;
  currentUrl: string;
  currentId: string;
  enableLoginReport: boolean;
  enableLoginReportSubscription: Subscription;

  constructor(
    private _formBuilder: FormBuilder,
    private _angularFireStorage: AngularFireStorage,
    private _firestore: FirestoreService,
    private _authService: AuthService,
    private _subjects: SubjectsService
  ) { }

  ngOnInit() {
    this.enableLoginReportSubscription = this._subjects.enableLoginReportSubject.subscribe(boolean => {
      this.enableLoginReport = boolean;
    })

    this.filesUploadForm = this._formBuilder.group({
      files: new FormControl(null, Validators.required)
    });

    this.isLoading = true;
    this._firestore.getFiles().subscribe(files => {
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
    this._firestore.getUser(userData.email).subscribe(user => {
      this.userAdditionalData = user.map(e => {
        return {
          id: e.payload.doc.id,
          ...e.payload.doc.data() as UserAdditionalInfo
        }
      })
      this.confirmBeforeDelete = this.userAdditionalData[0].confirmDelete;
    })
  }

  ngOnDestroy() {
    this.enableLoginReportSubscription.unsubscribe();
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
        this._angularFireStorage.upload(
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
        this._firestore.uploadFiles(file)
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
    this._firestore.deleteFile(url);
    this._firestore.deleteFileInfo(id);
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
    this._authService.logout();
  }

  confirmDelete(event) {
    const userId = this.userAdditionalData[0].id;
    if (event.target.checked) {
      this.confirmBeforeDelete = true;
      const isChecked = this.confirmBeforeDelete;
      const newInfo = { isChecked, userId }
      this._firestore.updateUser(newInfo);
    } else {
      this.confirmBeforeDelete = false;
      const isChecked = this.confirmBeforeDelete;
      const newInfo = { isChecked, userId }
      this._firestore.updateUser(newInfo);
    }
  }

  onEnableLoginReport() {
    this._subjects.loginRerport();
  }
}