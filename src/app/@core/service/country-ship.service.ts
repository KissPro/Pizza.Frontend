import { Injectable } from '@angular/core';
import { CountryShipData } from '../models/country-ship';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

@Injectable()
export class CountryShipService extends CountryShipData {
  readonly allCountryURL = environment.apiUrl + '/api/country/all';
  readonly createCountryURL = environment.apiUrl + '/api/country';
  readonly countryURL = environment.apiUrl + '/api/country/';


  constructor(private http: HttpClient) {
    super();
  }
  getAllCountryShip(): Observable<any> {
    return this.http.get<any>(this.allCountryURL);
  }
  createCountryShip(create: any): Observable<CountryShipService> {
    return this.http.post<any>(this.createCountryURL, create);
  }
  editCountryShip(id: string, update: any): Observable<any> {
    return this.http.put<any>(this.countryURL + id, update);
  }
  deleteCountryShip(id: string): Observable<any> {
    return this.http.delete<any>(this.countryURL + id);
  }
}
