import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'environments/environment';
import { from, Observable } from 'rxjs';
import { Employee, EmployeeModel } from '../models/Employee';
import { User } from '../data/users';

@Injectable({ providedIn: 'root' })
export class UserService {
    constructor(private http: HttpClient) { }
    readonly userURL = `${environment.ADWeb_URI}/adweb/people/me/v1`;

    getAll() {
        return this.http.get<User[]>(`${environment.apiUrl}/users`);
    }

    getUser(token: string): Observable<any> {
        const reqHeader = new HttpHeaders({
            'Authorization': 'Bearer ' + token,
         });
        return this.http.get<EmployeeModel>(this.userURL, { headers: reqHeader });
    }
}
