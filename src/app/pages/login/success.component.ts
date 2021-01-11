import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { concatMap } from 'rxjs/operators';
import { AuthenticationService } from 'app/@core/service/authentication.service';
import { AdwebService } from 'app/@core/service/adweb.service';
import { AuthorizationService } from 'app/@core/service/authorization.service.';
import { EmployeeRole } from 'app/@core/models/Employee';

@Component({ templateUrl: 'success.component.html' })
export class SuccessComponent implements OnInit {
    code: string;
    token: any;
    alive: boolean;
    constructor(
        private activeRoute: ActivatedRoute,
        private adwebService: AdwebService,
        private authoService: AuthorizationService,
        private router: Router,
    ) {
    }
    ngOnInit() {
        this.activeRoute.queryParams.subscribe(params => {
            this.code = params['code'];
            console.log(this.code);
            if (this.code != undefined) {
                this.adwebService.getAccessToken(this.code)
                    .pipe(
                        concatMap(token => {
                            this.token = token;
                            return this.adwebService.getUserInfor(token["access_token"]);
                        }),
                    )
                    .subscribe(user => {
                        localStorage.setItem('user', JSON.stringify(user));
                        // Get list user roles
                        this.adwebService.getUserRoleByID(this.token["access_token"], user.employee["employee_id"])
                            .subscribe(roles => {
                                // set user authorize base role
                                this.authoService.getToken(roles)
                                    .subscribe(token => {
                                        // Set role
                                        var role: EmployeeRole = {
                                            listRole: roles,
                                            token: token
                                        }
                                        // localStorage.setItem('authorize-token', JSON.stringify(token));
                                        localStorage.setItem('role', JSON.stringify(role));
                                        this.router.navigate(['/']);
                                    });
                            });
                    });
            }
            // When logout
            else {
                this.router.navigate(['/']);
            }
        });
    }
}
