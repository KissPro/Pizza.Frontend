import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { ConfigData, ConfigModel } from '../models/config';

@Injectable()
export class ConfigService extends ConfigData {

  readonly configURL = environment.apiUrl + '/api/config';

  constructor(private http: HttpClient) {
    super();
  }
  
  getAllConfig(): Observable<ConfigModel[]> {
    return this.http.get<ConfigModel[]>(this.configURL);
  }
  createOrUpdateConfig(create: any): Observable<ConfigModel> {
    return this.http.post<any>(this.configURL, create);
  }
  deleteConfig(id: string): Observable<any> {
    return this.http.delete<any>(this.configURL + '/' + id);
  }
}
