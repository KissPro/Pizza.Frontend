import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { AssignModel, ExtendDLModel } from '../models/assign';
import { Observable } from 'rxjs';

@Injectable()
export class AssginService {
  readonly url = environment.apiUrl + '/api/assign/';
  constructor(private http: HttpClient) {
  }

  // Create Information
  createAssign(assign: AssignModel) {
    return this.http.post(this.url + 'insert-update-assign', assign);
  }
  createDeadLine(deadLine: ExtendDLModel) {
    return this.http.post(this.url + 'insert-update-deadline', deadLine);
  }

  // Get Information

  getListDeadLine(assignId: string) : Observable<ExtendDLModel[]> {
    return this.http.get<ExtendDLModel[]>(this.url + 'get-deadline/' + assignId);
  }
  getAssign(assignId: string) : Observable<AssignModel>{
    return this.http.get<AssignModel>(this.url + 'get-assign-id/' + assignId);
  }
  getListAssign(issueId: string) : Observable<AssignModel[]>{
    return this.http.get<AssignModel[]>(this.url + 'get-list-assign/' + issueId);
  }

  // Remove
  removeAssign(assignId: string) {
    return this.http.delete(this.url + 'remove-assign/' + assignId)
  }
}

