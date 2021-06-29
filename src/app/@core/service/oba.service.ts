import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { OBAIssueFilterModel } from '../models/issue-type';

@Injectable({ providedIn: 'root' })
export class OBAService {
    constructor(private http: HttpClient) { }
    readonly adwebUrl = environment.apiUrl + '/api/oba/';

    getListOBA(issueFilter: OBAIssueFilterModel) {
        // var params = {
        //     'factory' : 'NBB',
        //     'date': new Date('2021-06-01'),
        //     'npi': false
        // };
        var params = {
            'factory' : issueFilter.factory,
            'date': issueFilter.date,
            'npi': issueFilter.npi == 'NPI' ? true : false
        };
        return this.http.get(this.adwebUrl + 'lists?queryJson=' + JSON.stringify(params));
    }
}
