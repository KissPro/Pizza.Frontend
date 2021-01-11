import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'environments/environment';
import { DNData, DNManualModel, DNModel } from '../models/dn';
import { DataTablesResponse } from '../models/datatables';

@Injectable()
export class DNService extends DNData {

    readonly dnURL = environment.apiUrl + '/api/dn/';

    constructor(private http: HttpClient) {
        super();
    }
    getDN(dtParameter: any): Observable<DataTablesResponse> {
        return this.http.post<DataTablesResponse>(this.dnURL + 'all-list',
            dtParameter);
    }
    getDNManual(dtParameter: any, type: string): Observable<DataTablesResponse> {
        return this.http.post<DataTablesResponse>(this.dnURL + 'list-manual/' + type,
            dtParameter);
    }
    updateManual(ds: DNManualModel) {
        return this.http.post(this.dnURL + 'update-manual', ds);
    }
    removeManual(ds: DNManualModel) {
        return this.http.post(this.dnURL + 'remove-manual', ds);
    }

    getListDNCOO(cooNo: string): Observable<DNModel[]> {
        return this.http.get<DNModel[]>(this.dnURL + 'open-coo/' + cooNo);
    }
    DownloadDN() {
        return this.http.get(this.dnURL + 'download-dn', {responseType: 'blob'});
    }
    DownloadManual(type: string) {
        return this.http.get(this.dnURL + 'download-manual/' + type, {responseType: 'blob'});
    }
}
