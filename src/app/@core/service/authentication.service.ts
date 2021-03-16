import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { EmployeeModel } from '../models/Employee';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    private userSubject: BehaviorSubject<EmployeeModel>;
    public user: Observable<EmployeeModel>;
    public login_uri: string = `${environment.ADWeb_URI}/adweb/oauth2/authorization/v1?scope=read&redirect_uri=${environment.CLIENT_REDIRECT_URL}&response_type=code&client_id=${environment.CLIENT_ID}&state=online`;
    public logout_uri: string = `${environment.ADWeb_URI}/web/session/logout?redirect=${environment.CLIENT_REDIRECT_URL}`;
    public loginStatus: boolean = true;

    constructor(
    ) {
        this.userSubject = new BehaviorSubject<EmployeeModel>(JSON.parse(localStorage.getItem('user')));
        this.user = this.userSubject.asObservable();
    }

    public get userValue(): EmployeeModel {
        return this.userSubject.value;
    }

    // Get user infor
    userId() {
        return JSON.parse(localStorage.getItem('user')).employee.employee["employee_id"];
    }
    userName() {
        return JSON.parse(localStorage.getItem('user')).employee.employee["display_name"];
    }
    team() {
        return JSON.parse(localStorage.getItem('user')).employee.employee["department"][1];
    }

    token() {
        return JSON.parse(localStorage.getItem('user')).token["access_token"];
    }

    logout() {
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        this.userSubject.next(null);
        // redirect logout session adweb
        window.location.href = this.logout_uri;
    }
    
}
