import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { ApprovalModel } from '../models/issue-approval';
import { Observable } from 'rxjs';

@Injectable()
export class ApprovalService {
  readonly url = environment.apiUrl + '/api/approval/';
  constructor(private http: HttpClient) {
  }
  
  insertOrUpdate(approval: ApprovalModel) {
    return this.http.post(this.url, approval);
  }

  getListApprovalByIssueId(issueId: string) : Observable<ApprovalModel[]>{
    return this.http.get<ApprovalModel[]>(this.url + 'get-issueId/' + issueId);
  }
  getApprovalById(id : string) : Observable<ApprovalModel> {
    return this.http.get<ApprovalModel>(this.url + 'get-id/' + id);
  }

  removeApprovalByIssueId(issueId: string) {
    return this.http.delete(this.url + 'remove-issueId/' + issueId);
  }
  removeApprovalById(id: string) {
    return this.http.delete(this.url + 'remove-id/' + id)
  }
}
