import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthenticationService } from '../service/authentication.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(
        private router: Router,
        private authenticationService: AuthenticationService,
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        // If user exists -> pass
        if (JSON.parse(localStorage.getItem('user'))) {
            return true;
        }
        // If not login -> redirect
        window.location.href = this.authenticationService.login_uri;
        return false;
    }
}
