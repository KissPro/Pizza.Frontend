import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthorizationService {

    readonly url = environment.apiUrl + '/api/authorize/';

    constructor(
        private http: HttpClient,
    ) {
    }

    getToken(userRoles: string[]) : Observable<string>{
        return this.http.post<string>(this.url + 'token', userRoles);
    }
}
