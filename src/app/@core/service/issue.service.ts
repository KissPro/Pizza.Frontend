import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { IssueData } from '../models/issue';
import { DataTablesResponse } from '../models/datatables';

@Injectable()
export class IssueService extends IssueData {
  readonly url = environment.apiUrl + '/api/issue/';
  constructor(private http: HttpClient) {
    super();
  }
  getIssue(dtParameter: any): Observable<DataTablesResponse> {
    return this.http.post<DataTablesResponse>(this.url + 'list-issue', dtParameter);
  }
  download() {
    return this.http.get(this.url + 'download', { responseType: 'blob' });
  }
  // getAllPlant(): Observable<any> {
  //   return this.http.get<any>(this.allPlantURL);
  // }
  // createPlant(create: any): Observable<PlantData> {
  //   return this.http.post<any>(this.createPlantURL, create);
  // }
  // editPlant(id: string, update: any): Observable<any> {
  //   return this.http.put<any>(this.plantURL + id, update);
  // }
  // deletePlant(id: string): Observable<any> {
  //   return this.http.delete<any>(this.plantURL + id);
  // }
}

