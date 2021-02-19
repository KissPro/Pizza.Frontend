import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { DropListModel } from '../models/issue-config';

@Injectable()
export class ConfigIssueService {
  readonly url = environment.apiUrl + '/api/config/';
  constructor(private http: HttpClient) {
  }
  
  getDropdown(name: string) {
    return this.http.get<DropListModel[]>(this.url + 'list-dropdown/' + name);
  }
}
