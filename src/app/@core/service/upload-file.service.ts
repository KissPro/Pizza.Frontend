import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { AuthenticationService } from './authentication.service';

@Injectable({
    providedIn: 'root',
})
export class UploadService {

    constructor(
        private http: HttpClient,
        private userService: AuthenticationService,
    ) { }
    user = this.userService.userId();
    readonly urlFile = environment.apiUrl + '/api/file';

    UploadExcel(formData: FormData, type: string) { // type: folder name, ex: Plant/CountryShip
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'multipart/form-data');
        headers.append('Accept', 'application/json');
        return this.http.post(this.urlFile + '/upload/' + type, formData, {
            headers: headers,
            reportProgress: true,
            observe: 'events',
        });
    }
    DeleteFile(path: string) {
        const file = {
            'path': path,
            'userId': this.user,
          };
        return this.http.post(this.urlFile + '/delete', file);
    }

    SubmitUpload(urlUpload: string, path: string) {
        const file = {
            'path': path,
            'userId': this.user,
          };
        return this.http.post(environment.apiUrl + urlUpload, file);
    }

    DownloadFile(name: string) {
        return this.http.get(this.urlFile + '/download/' + name, {responseType: 'blob'});
    }

    ShowFile(newBlob: any, filename: string) {
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveOrOpenBlob(newBlob);
          return;
        }
        // For other browsers:
        const data = window.URL.createObjectURL(newBlob);
        const link = document.createElement('a');
        link.href = data;
        link.download = filename;
        link.click();
        setTimeout(() => {
          // For Firefox it is necessary to delay revoking the ObjectURL
          window.URL.revokeObjectURL(data);
        }, 100);
      }
}
