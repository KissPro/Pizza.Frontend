import { AfterContentChecked, AfterViewChecked, AfterViewInit, Component, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { NbSidebarService, NbToastrService } from '@nebular/theme';
import { LayoutService } from 'app/@core/utils';
import { BoomEcusModel } from 'app/@core/models/boom-ecus';
import { BoomEcusService } from 'app/@core/service/boom-ecus.service';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { UploadService } from 'app/@core/service/upload-file.service';
import { IssueModel } from 'app/@core/models/issue';
import { IssueService } from 'app/@core/service/issue.service';
import { Router } from '@angular/router';
import { GuidService } from 'app/@core/service/guid.service';
import { AdwebService } from 'app/@core/service/adweb.service';
import { ToastrComponent } from 'app/pages/modal-overlays/toastr/toastr.component';
import { mergeMap } from 'rxjs/operators';
import { formatDate } from '@angular/common';
import { AuthenticationService } from 'app/@core/service/authentication.service';
import { OBAService } from 'app/@core/service/oba.service';

@Component({
  selector: 'ngx-issue',
  templateUrl: './issue.component.html',
  styleUrls: ['./issue.component.scss']
})
export class IssueComponent implements OnInit {

  dtOptions: DataTables.Settings = {};
  issueModel: IssueModel[];

  dtTrigger: Subject<any> = new Subject();
  indexTable: number;
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  alert = new ToastrComponent(this.toastrService);

  dateTo: Date = new Date();
  dateFrom: Date = new Date();
  dateRangeValue: any;
  newIssueId: string  = '';
  

  constructor(private http: HttpClient,
    private issueService: IssueService,
    private uploadService: UploadService,
    private sidebarService: NbSidebarService,
    private guidService: GuidService,
    private layoutService: LayoutService,
    private toastrService: NbToastrService,
    private adwebService: AdwebService,
    private userService: AuthenticationService,
    private router: Router,
    private obaService: OBAService,
  ) { }

  ngOnInit(): void {
    this.loadIssueTable();
    this.newIssueId = this.guidService.getGuid();

    // check adweb service
    this.adwebService.getUserDetailByID(this.userService.token(),this.userService.userId()).toPromise();
    
    // set daterange default
    this.dateFrom.setDate(this.dateTo.getDate() - 14);
    this.dateRangeValue = 
    {
      'start' : this.dateFrom,
      'end' : this.dateTo,
    }
  }

  searchByDateRange(date: any) {
    if (date?.start && date?.end) {
      this.dateFrom = new Date(date.start);
      this.dateTo = new Date(date.end);
      console.log(this.dateTo);
      this.rerender();
    }
  }

  loadIssueTable() {
    const that = this;
    var token = JSON.parse(localStorage.getItem('user')).token["access_token"];

    this.toggleSidebar();
    this.dtOptions[1] = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: true,
      scrollX: true, // header scroll
      scrollY: '56vh', // hight data
      order: [6, 'desc'],

      ajax: (dataTablesParameters: any, callback) => {
        dataTablesParameters.from = this.dateFrom;
        dataTablesParameters.to = this.dateTo;

        that.issueService.getIssue(dataTablesParameters)
          .subscribe(resp => {
            var listIssue = resp?.data;
            that.issueModel = listIssue;
            that.indexTable = resp?.start;
            callback({
              recordsTotal: resp?.recordsTotal,
              recordsFiltered: resp?.recordsFiltered,
              from: this.dateFrom,
              to: this.dateTo,
              data: [],
            });
            // setTimeout(() => this.rerender(), 1); // resize header
          });
      },
      columns: [
        // tslint:disable-next-line: max-line-length
        { data: 'index' }, { data: 'issueNo' }, { data: 'title' },
        { data: 'failureDesc' }, { data: 'processType' },
        { data: 'createdByName' }, { data: 'createdDate' },{ data: 'issueStatus' },
        { data: 'open' },
      ],
      columnDefs: [
        { targets: 'no-sort', orderable: false },
      ],
    };
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }
  // For update size columns
  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }
  toggleSidebar() {
    this.sidebarService.compact('menu-sidebar');
    this.layoutService.changeLayoutSize();
  }

  getPlainText(rickText: string) {
    return $(rickText).text();
  }

  // Thao tác với table
  currentRow;
  selectedRow(event, i) {
    if (i !== this.currentRow)
      this.currentRow = i;
    else
      this.currentRow = null;
  }

  downloadIssue() {
    this.issueService.download()
      .subscribe(
        result => this.uploadService.ShowFile(result, 'Download_BoomEcus_' + new Date().toLocaleString()),
      );
  }

  reloadIssueTable() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }


  // Show progress bar
  showIssueStatus(status: string) {
    if (status.toLocaleUpperCase() === 'OPEN')
      return 25;
    else if (status.toLocaleUpperCase() === 'ON-GOING')
      return 50;
    else if (status.toLocaleUpperCase() === 'MONITORING')
      return 75;
    else if (status.toLocaleUpperCase() === 'DONE')
      return 100;
    else
      return 0; // re-open
  }
  progressStatus(value: number) {
    if (value <= 25) {
      return 'danger';
    } else if (value <= 50) {
      return 'warning';
    } else if (value <= 75) {
      return 'info';
    } else {
      return 'success';
    }
  }

  // Action
  openIssue(issueId: string) {
    console.log(issueId);
    this.router.navigate(['/pages/tables/create-issue', { 'issueId': issueId, 'type': 'open', 'step': 'openIssue', skipLocationChange: true }]);
  }
  newIssue() {
    this.router.navigate(['/pages/tables/create-issue', { 'issueId': this.guidService.getGuid(), 'type': 'new', 'step': 'openIssue', skipLocationChange: true }]);
  }
  removeIssue(issueId: string, type: string) {
    this.issueService.removeIssue(issueId, type).subscribe(result => {
      if (result == true) {
        this.alert.showToast('success', 'Success', 'Remove issue successfully!');
        this.reloadIssueTable();
      }
    })
  }
}


