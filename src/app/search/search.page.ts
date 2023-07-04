import { Component, OnInit } from '@angular/core';
// import { Platform } from '@ionic/angular';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing';
// import {
//   FileTransfer,
//   FileTransferObject,
// } from '@awesome-cordova-plugins/file-transfer/ngx';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { IChildVisit } from '../pastvisit/pastvisit';
import { LocalStorageService } from '../services/localstorage.service';
// import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
// import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
// import { FilePath } from '@awesome-cordova-plugins/file-path/ngx';
// import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';
// import * as XLSX from 'xlsx';
// import { saveAs } from 'file-saver';

interface Ischool {
  name: string;
}
export interface IChild {
  id: string;
  childName: string;
  fatherName: string;
  motherName: string;
  dateOfBirth: string;
  email: string;
  whatsappNumber: number;
  selectedSchool: string;
}
@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage implements OnInit {
  childs: IChild[] = [];
  searchQuery: string = '';
  searchResults: IChild[] = [];
  selectedChilds: IChild[] = [];
  childArray: any[] = [];
  showClearSearchButton: boolean = false;
  showNoStudentMsg = false;
  noChildFound: boolean = false;

  constructor(
    private file: File, // private androidPermissions: AndroidPermissions, // private fileTransfer: FileTransfer, // private filePath: FilePath, // private fileOpener: FileOpener, // private platform: Platform
    private _storage: LocalStorageService
  ) {}
  searchItems() {
    this.searchResults = this.childs.filter((child) =>
      child.childName.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
    if (this.searchResults.length === 0) {
      this.noChildFound = true;
      this.showClearSearchButton = true;
    }

    this.showClearSearchButton = true;
  }

  clearSearch() {
    this.searchQuery = '';
    this.selectedChilds = [];
    this.searchResults = [];
    this.showClearSearchButton = false;
    this.showNoStudentMsg = false;
    this.noChildFound = false;
  }
  ngOnInit() {
    //@ts-ignore
    const storedChilds = JSON.parse(localStorage.getItem('childs')) || [];
    this.childs = storedChilds;
  }

  onChildClick(child: IChild) {
    //@ts-ignore
    const storedChilds = JSON.parse(localStorage.getItem('childs')) || [];
    this.selectedChilds = storedChilds.filter(
      (ch: IChild) => ch.childName === child.childName
    );
    this.searchResults = [];
    // After populating searchResults array
    this.showClearSearchButton = true;
    if (this.selectedChilds.length === 0) {
      this.showNoStudentMsg = true;
      this.noChildFound = true;
    } else {
      this.showNoStudentMsg = false;
      this.noChildFound = false;
    }
  }

  onDownload(child: IChild) {
    const childVisit: IChildVisit[] = this._storage.getItem(child.id);
    console.log(childVisit);
    if (childVisit.length > 1) {
      const lastIndex = childVisit.length - 1;
      this.createAndWriteCSVOfSingleChild(childVisit[lastIndex]);
    } else {
      this.createAndWriteCSVOfSingleChild(childVisit[0]);
    }
  }

  convertObjectToCSV(object: IChildVisit): string {
    const keys = Object.keys(object);
    const header = keys.join(', ');
    //@ts-ignore
    const values = keys.map((key) => object[key]);
    const row = values.map((value) => `"${value}"`).join(', ');

    return `${header}\n${row}`;
  }

  createAndWriteCSVOfSingleChild(child: IChildVisit) {
    const fileName = Date.now().toString() + 'data.csv';
    const csvString = this.convertObjectToCSV(child);

    const dataDirectory = this.file.dataDirectory;

    this.file
      .writeFile(dataDirectory, fileName, csvString, { replace: true })
      .then(() => {
        const filePath = dataDirectory + fileName;
        const message = 'child' + ' CSV file downloaded successfully.';

        // Share the CSV file using SocialSharing
        SocialSharing.share(undefined, undefined, filePath, message)
          .then(() => {
            console.log('CSV file shared successfully.');
          })
          .catch((error: any) => {
            console.error('Error sharing CSV file:', error);
          });
      })
      .catch((error: any) => {
        console.error('Error creating and writing CSV file:', error);
      });
  }
  createAndWriteCSV(child: IChild[]) {
    const fileName = Date.now().toString() + 'data.csv';
    const csvString = this.convertArrayToCSV(child);

    const dataDirectory = this.file.dataDirectory;

    this.file
      .writeFile(dataDirectory, fileName, csvString, { replace: true })
      .then(() => {
        const filePath = dataDirectory + fileName;
        const message = 'Childs ' + ' CSV file downloaded successfully.';

        // Share the CSV file using SocialSharing
        SocialSharing.share(undefined, undefined, filePath, message)
          .then(() => {
            console.log('CSV file shared successfully.');
          })
          .catch((error: any) => {
            console.error('Error sharing CSV file:', error);
          });
      })
      .catch((error: any) => {
        console.error('Error creating and writing CSV file:', error);
      });
  }

  showNoChildMsg(): boolean {
    return this.childs.length === 0 ? true : false;
  }

  BulkChildDownload(selectedChilds: IChild[]) {
    this.createAndWriteCSV(selectedChilds);
  }

  convertArrayToCSV(objects: IChild[]): string {
    if (objects.length === 0) {
      return ''; // Return an empty string if the array is empty
    }

    const keys = Object.keys(objects[0]);
    const header = keys.join(',');

    const rows = objects.map((object) => {
      //@ts-ignore
      const values = keys.map((key) => object[key]);
      return values.map((value) => `"${value}"`).join(', ');
    });

    return `${header}\n\n${rows.join('\n\n\n')}`;
  }

  isPrintable(child: IChild): boolean {
    const childData: IChildVisit[] = this._storage.getItem(child.id);
    return childData.length > 0 ? false : true;
  }
}
