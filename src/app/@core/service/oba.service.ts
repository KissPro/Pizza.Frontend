import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';

@Injectable({ providedIn: 'root' })
export class OBAService {
    constructor(private http: HttpClient) { }
    readonly adwebUrl = environment.apiUrl + '/api/oba/';

    getListOBA() {
        var params = {
            'factory' : 'NBB',
            'date': new Date('2021-06-01'),
            'npi': false
        };
        return this.http.get(this.adwebUrl + 'lists?queryJson=' + JSON.stringify(params));
    }
}
