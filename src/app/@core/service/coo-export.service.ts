import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { COOExportModel } from '../models/coo-export';

@Injectable({
    providedIn: 'root',
})
export class COOExportService {
    constructor(
        private http: HttpClient,
    ) { }
    readonly url = environment.apiUrl + '/api/dn/';

    ExportCOO(coo: COOExportModel) {
        return this.http.post(this.url + 'export-coo', coo, { responseType: 'blob' });
    }
    SaveCOO(coo: COOExportModel) {
        return this.http.post(this.url + 'save-coo', coo);
    }
}
