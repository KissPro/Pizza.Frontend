import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthenticationService } from '../service/authentication.service';
import { NbToastrService } from '@nebular/theme';
import { ToastrComponent } from 'app/pages/modal-overlays/toastr/toastr.component';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';


@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(
        private authenticationService: AuthenticationService,
        private toastrService: NbToastrService,
        private router: Router,
    ) { }

    alert = new ToastrComponent(this.toastrService);

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError((err: HttpErrorResponse) => {
            const error = (err.error && err.error.message) || err.statusText;
            console.log(err);
            if (error == 'OK') // send mail not return error
                return;
            if (err.status === 401) {
                console.log(err.status)
                this.authenticationService.reLogin();
            }
            else if (err.status === 403) {
                this.router.navigate(['/permission-denied']);
            }
            else {
                if (err.url.includes('send-mail'))
                    this.alert.showToast('danger', 'Error client', 'Kindly check email!');
                if (err.error instanceof ErrorEvent) {
                    // client-side error
                    this.alert.showToast('danger', 'Error client', 'Kindly contact IT team!');

                } else {
                    // server-side error
                    this.alert.showToast('danger', 'Error Server', 'Kindly contact IT team!');
                }
            }
       
            return throwError(error);
        }));
    }

    // Check token expired -> only check for token server.
    // private tokenExpired() {
    //     const expiry = JSON.parse(localStorage.getItem('role')).token.expiration;
    //     return new Date >= new Date(expiry);
    // }
}
