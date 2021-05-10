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
  readonly urlUpload = environment.APIPortalURL + '/upload';
  readonly projectName = environment.ProjectName;

  readonly urlFileImages = 'http://localhost:5500/api/images/images-upload/Pizza';


  // UploadExcel(formData: FormData, type: string) { // type: folder name, ex: Plant/CountryShip
  //   const headers = new HttpHeaders();
  //   headers.append('Content-Type', 'multipart/form-data');
  //   headers.append('Accept', 'application/json');
  //   return this.http.post(this.urlFile + '/upload/' + type, formData, {
  //     headers: headers,
  //     reportProgress: true,
  //     observe: 'events',
  //   });
  // }

  UploadFile(formData: FormData, type: string) { // type: folder name, ex: Plant/CountryShip
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'multipart/form-data');
    headers.append('Accept', 'application/json');
    return this.http.post(this.urlUpload + '/files/' + this.projectName + '/' + type, formData, {
      headers: headers,
      reportProgress: true,
      observe: 'events',
    });
  }



  UploadImage(formData: FormData) { // type: folder name, ex: Plant/CountryShip
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'multipart/form-data');
    headers.append('Accept', 'application/json');
    return this.http.post(this.urlUpload + '/images/' + this.projectName, formData, {
      headers: headers,
      observe: 'events',
    });
  }

  DeleteFile(path: string) {
    const file = {
      'path': path,
      'userId': this.user,
    };
    return this.http.post(this.urlUpload + '/delete', file);
  }

  SubmitUpload(urlUpload: string, path: string) {
    const file = {
      'path': path,
      'userId': this.user,
    };
    return this.http.post(environment.apiUrl, file);
  }

  DownloadFile(path: string, type: string) {
    const file = {
      'path': path,
      'type': type,
    };
    console.log(file);
    return this.http.post(this.urlUpload + '/download', file, { responseType: 'blob' });
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

  // Return icon of file
  IconFile(type: string, url: string) {
    if (type === 'application/vnd.ms-excel' || type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      return `assets\\images\\excel.png`;
    else if (type.includes("image")) {
      if (url && url.includes('base64'))
        return url;
      else if (url)
        return environment.APIPortalURL + url;
      else
        return `assets\\images\\picture.png`;
    }
    else if (type.includes("presentation"))
      return `assets\\images\\powerpoint.png`;
    else if (type.includes("document"))
      return `assets\\images\\word.png`;
    else
      return `assets\\images\\file.png`;
  }
}
