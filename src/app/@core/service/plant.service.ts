import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { PlantData, PlantModel } from '../models/plant';

@Injectable()
export class PlantService extends PlantData {

  readonly allPlantURL = environment.apiUrl + '/api/plant/all';
  readonly createPlantURL = environment.apiUrl + '/api/plant';
  readonly plantURL = environment.apiUrl + '/api/plant/';

  constructor(private http: HttpClient) {
    super();
  }
  getAllPlant(): Observable<any> {
    return this.http.get<any>(this.allPlantURL);
  }
  createPlant(create: any): Observable<PlantData> {
    return this.http.post<any>(this.createPlantURL, create);
  }
  editPlant(id: string, update: any): Observable<any> {
    return this.http.put<any>(this.plantURL + id, update);
  }
  deletePlant(id: string): Observable<any> {
    return this.http.delete<any>(this.plantURL + id);
  }
}
