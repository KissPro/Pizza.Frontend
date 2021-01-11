import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';


import { environment } from 'environments/environment';
import { Router } from '@angular/router';
import { data, post } from 'jquery';
import { Employee, EmployeeModel } from '../models/Employee';
import { from } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    private userSubject: BehaviorSubject<EmployeeModel>;
    public user: Observable<EmployeeModel>;
    public login_uri: string = `${environment.ADWeb_URI}/adweb/oauth2/authorization/v1?scope=read&redirect_uri=${environment.CLIENT_REDIRECT_URL}&response_type=code&client_id=${environment.CLIENT_ID}&state=online`;
    public logout_uri: string = `${environment.ADWeb_URI}/web/session/logout?redirect=${environment.CLIENT_REDIRECT_URL}`;
    public loginStatus: boolean = true;

    constructor(
        private router: Router,
        private http: HttpClient,
    ) {
        this.userSubject = new BehaviorSubject<EmployeeModel>(JSON.parse(localStorage.getItem('user')));
        this.user = this.userSubject.asObservable();
    }

    public get userValue(): EmployeeModel {
        return this.userSubject.value;
    }

    // Get user infor
    userId() {
        return (<EmployeeModel>JSON.parse(localStorage.getItem('user'))).employee["employee_id"];
    }
    userName() {
        return (<EmployeeModel>JSON.parse(localStorage.getItem('user'))).employee["display_name"];
    }

    logout() {
        // remove user from local storage to log user out
        // localStorage.removeItem('user');
        // localStorage.removeItem('user-role');
        // localStorage.removeItem('authorize-token');

        localStorage.removeItem('user');
        localStorage.removeItem('role');
        this.userSubject.next(null);

        // redirect logout session adweb
        window.location.href = this.logout_uri;
    }
    
}
