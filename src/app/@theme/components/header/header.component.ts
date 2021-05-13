import { Component, OnDestroy, OnInit } from '@angular/core';
import { NbMediaBreakpointsService, NbMenuService, NbSidebarService, NbThemeService } from '@nebular/theme';

import { UserData } from '../../../@core/data/users';
import { LayoutService } from '../../../@core/utils';
import { map, takeUntil } from 'rxjs/operators';
import { BehaviorSubject, Subject } from 'rxjs';
import { Employee, EmployeeModel } from 'app/@core/models/Employee';
import { filter } from 'rxjs/operators';
import { AuthenticationService } from 'app/@core/service/authentication.service';

@Component({
  selector: 'ngx-header',
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {

  private destroy$: Subject<void> = new Subject<void>();
  userPictureOnly: boolean = false;
  user: any;
  userAd: string;

  userMenus = [{ title: 'Profile' }, { title: 'Log out' }];

  constructor(private sidebarService: NbSidebarService,
    private menuService: NbMenuService,
    private userService: UserData,
    private layoutService: LayoutService,
    private authenService: AuthenticationService,
    private breakpointService: NbMediaBreakpointsService) {
  }

  clickMenu(event) {
    console.log(event);
  }

  ngOnInit() {

    this.userAd = this.authenService.userName();

    this.userService.getUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe((users: any) => {
        this.user = (this.userAd !== 'Hoang Ngo Van') ? users.adweb : users.hoang;
      });

    // Log out
    this.menuService.onItemClick()
      .subscribe(title => {
        if (title.item.title === 'Log out') this.authenService.logout();
      });

    const { xl } = this.breakpointService.getBreakpointsMap();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleSidebar(): boolean {
    this.sidebarService.toggle(true, 'menu-sidebar');
    this.layoutService.changeLayoutSize();
    return false;
  }

  navigateHome() {
    this.menuService.navigateHome();
    return false;
  }
}
