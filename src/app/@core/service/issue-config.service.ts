import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { DropListModel } from '../models/issue-config';
import { Observable } from 'rxjs';
import { ConfigModel } from '../models/config';

@Injectable()
export class ConfigIssueService {
  readonly url = environment.apiUrl + '/api/config/';
  constructor(private http: HttpClient) {
  }
  
  getDropdown(name: string) {
    return this.http.get<DropListModel[]>(this.url + 'list-dropdown/' + name);
  }
  getAllConfig(): Observable<ConfigModel[]> {
    return this.http.get<ConfigModel[]>(this.url);
  }
  createOrUpdateConfig(create: any): Observable<ConfigModel> {
    return this.http.post<any>(this.url, create);
  }
  deleteConfig(id: string): Observable<any> {
    return this.http.delete<any>(this.url + '/' + id);
  }

}
