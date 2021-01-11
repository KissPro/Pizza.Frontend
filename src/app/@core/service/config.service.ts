import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { ConfigData, ConfigModel } from '../models/config';

@Injectable()
export class ConfigService extends ConfigData {
  readonly allConfigURL = environment.apiUrl + '/api/config/all';
  readonly createConfigURL = environment.apiUrl + '/api/config';
  readonly configURL = environment.apiUrl + '/api/config/';

  constructor(private http: HttpClient) {
    super();
  }
  getAllConfig(): Observable<any> {
    return this.http.get<any>(this.allConfigURL);
  }
  createConfig(create: any): Observable<ConfigModel> {
    return this.http.post<any>(this.createConfigURL, create);
  }
  editConfig(id: string, update: any): Observable<any> {
    return this.http.put<any>(this.configURL + id, update);
  }
  deleteConfig(id: string): Observable<any> {
    return this.http.delete<any>(this.configURL + id);
  }
}
