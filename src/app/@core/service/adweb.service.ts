import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { environment } from 'environments/environment';
import { Observable, throwError } from 'rxjs';
import { Employee, EmployeeModel } from '../models/Employee';
import { catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AdwebService {
    constructor(private http: HttpClient) { }
    readonly adwebUrl = environment.apiUrl + '/api/adweb/';

    getAccessToken(code: string) {
        return this.http.get(this.adwebUrl + 'token/' + code);
    }

    getUserInfor(token: string): Observable<any> {
        return this.http.get<Employee[]>(this.adwebUrl + 'user-infor/'+ token);
    }

    getUserDetailByID(token: string, employee_id: string) {
        return this.http.get(this.adwebUrl + `user-detail/${token}/${employee_id}`);
    }

    getUserRoleByID(token: string, employee_id: string): Observable<string[]> {
        return this.http.get<string[]>(this.adwebUrl + `user-role/${token}/${employee_id}`);
    }
}
