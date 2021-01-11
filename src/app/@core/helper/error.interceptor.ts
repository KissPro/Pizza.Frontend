import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthenticationService } from '../service/authentication.service';
import { NbToastrService } from '@nebular/theme';
import { ToastrComponent } from 'app/pages/modal-overlays/toastr/toastr.component';
import { Router } from '@angular/router';


@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(
        private authenticationService: AuthenticationService,
        private toastrService: NbToastrService,
        private router: Router,
    ) { }

    alert = new ToastrComponent(this.toastrService);

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError(err => {
            if (err.status === 401) {
                if (this.tokenExpired()) {
                    this.authenticationService.logout();
                }
            }
            if (err.status === 403) {
                this.router.navigate(['/permission-denied']);
            }
            else {
                if (err.error instanceof ErrorEvent) {
                    // client-side error
                    this.alert.showToast('danger', 'Error client', 'Kindly contact IT team!');

                } else {
                    // server-side error
                    this.alert.showToast('danger', 'Error Server', 'Kindly contact IT team!');
                }
            }
            const error = err.error.message || err.statusText;
            console.log(error);
            return throwError(error);
        }));
    }
    // Check token expired
    private tokenExpired() {
        const expiry = JSON.parse(localStorage.getItem('role')).token.expiration;
        return new Date >= new Date(expiry);
    }
}
