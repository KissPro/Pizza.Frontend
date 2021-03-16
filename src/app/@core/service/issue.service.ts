import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { IssueData, IssueModel } from '../models/issue';
import { DataTablesResponse } from '../models/datatables';
import { IMEIModel, OBAModel, ProcessModel, ProductModel, UploadFileModel, VerificationModel } from '../models/issue-type';

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
  getIssueById(issueId: string): Observable<IssueModel> {
    return this.http.get<IssueModel>(this.url + 'get-issue/' + issueId);
  }
  getListIssueByIssueNo(issueNo: string): Observable<IssueModel[]> {
    return this.http.get<IssueModel[]>(this.url + 'list-issue-issueNo/' + issueNo);
  }
  getListIssueByIssueTitle(issueTitle: string): Observable<IssueModel[]> {
    return this.http.get<IssueModel[]>(this.url + 'list-issue-issueTitle/' + issueTitle);
  }


  getListProcess() {
    return this.http.get<ProcessModel[]>(this.url + 'list-process');
  }
  getIMEIInformation(imei: string) {
    return this.http.get<IMEIModel[]>(this.url + 'imei-information/' + imei);
  }
  getListFileByIssueId(issueId: string): Observable<UploadFileModel[]> {
    return this.http.get<UploadFileModel[]>(this.url + 'list-file-issueId/' + issueId);
  }
  getListVerificationByIssueId(issueId: string): Observable<VerificationModel[]> {
    return this.http.get<VerificationModel[]>(this.url + 'get-verification-issueId/' + issueId);
  }
  getOBAById(issueId: string): Observable<OBAModel> {
    return this.http.get<OBAModel>(this.url + 'oba/' + issueId);
  }
  getProductById(issueId: string): Observable<ProductModel> {
    return this.http.get<ProductModel>(this.url + 'product/' + issueId);
  }
  getProcessByName(processName: string): Observable<ProcessModel> {
    return this.http.get<ProcessModel>(this.url + 'process-name/' + processName);
  }

  download() {
    return this.http.get(this.url + 'download', { responseType: 'blob' });
  }

  // Create Information
  createIssue(issue: IssueModel) {
    return this.http.post(this.url + 'create-issue', issue);
  }
  createOBA(oba: OBAModel) {
    return this.http.post(this.url + 'create-oba', oba);
  }
  createVerification(verification: VerificationModel) {
    return this.http.post(this.url + 'create-verification', verification);
  }
  createProduct(product: ProductModel) {
    return this.http.post(this.url + 'create-product', product);
  }
  createFile(file: UploadFileModel) {
    return this.http.post(this.url + 'create-file', file);
  }

  // Remove
  removeIssue(issueId: string, type: string) {
    return this.http.delete(this.url + 'remove-issue-id/' + issueId + '/' + type);
  }
  removeFileByIssueId(issueId: string) {
    return this.http.delete(this.url + 'remove-file-issueId/' + issueId);
  }
  removeFile(fileId: string) {
    return this.http.delete(this.url + 'remove-file-id/' + fileId);
  }
  removeVerification(id: string) {
    return this.http.delete(this.url + 'remove-verification-id/' + id);
  }

}

