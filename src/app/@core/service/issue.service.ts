import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { IssueData, IssueModel } from '../models/issue';
import { DataTablesResponse } from '../models/datatables';
import { IMEIModel, OBAModel, ProcessModel, ProductModel, UploadFileModel } from '../models/issue-type';

@Injectable()
export class IssueService extends IssueData {
  readonly url = environment.apiUrl + '/api/issue/';
  constructor(private http: HttpClient) {
    super();
  }
  // Get Information 
  getIssue(dtParameter: any): Observable<DataTablesResponse> {
    return this.http.post<DataTablesResponse>(this.url + 'list-issue', dtParameter);
  }
  getIssueById(issueId: string) : Observable<IssueModel> {
    return this.http.get<IssueModel>(this.url + 'get-issue/' + issueId);
  }
  getListProcess() {
    return this.http.get<ProcessModel[]>(this.url + 'list-process');
  }
  getIMEIInformation(imei: string) {
    return this.http.get<IMEIModel[]>(this.url + 'imei-information/' + imei);
  }

  download() {
    return this.http.get(this.url + 'download', { responseType: 'blob' });
  }

  // Create Information
  createIssue(issue: IssueModel){
    return this.http.post(this.url + 'create-issue', issue);
  }
  createOBA(oba: OBAModel){
    return this.http.post(this.url + 'create-oba', oba);
  }
  createProduct(product: ProductModel){
    return this.http.post(this.url + 'create-product', product);
  }
  createFile (file: UploadFileModel){
    return this.http.post(this.url + 'create-file', file);
  }
}

