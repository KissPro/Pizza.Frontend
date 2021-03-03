import { AfterContentChecked, AfterViewChecked, AfterViewInit, Component, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { NbSidebarService } from '@nebular/theme';
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

  constructor(private http: HttpClient,
    private issueService: IssueService,
    private uploadService: UploadService,
    private sidebarService: NbSidebarService,
    private guidService: GuidService,
    private layoutService: LayoutService,
    private adwebService: AdwebService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    const that = this;
    const headers = new HttpHeaders().set('Content-Type', 'application/json');

    this.toggleSidebar();
    this.dtOptions[1] = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: true,
      scrollX: true, // header scroll
      scrollY: '56vh', // hight data
      order: [1, 'asc'],

      ajax: (dataTablesParameters: any, callback) => {
        that.issueService.getIssue(dataTablesParameters)
          .subscribe(resp => {
            that.issueModel = resp.data;
            that.indexTable = resp.start;
            callback({
              recordsTotal: resp.recordsTotal,
              recordsFiltered: resp.recordsFiltered,
              data: [],
            });
            // setTimeout(() => this.rerender(), 1); // resize header
          });
      },
      columns: [
        // tslint:disable-next-line: max-line-length
        { data: 'index' }, { data: 'issueNo' }, { data: 'title' },
        { data: 'failureDesc' }, { data: 'issueStatus' }, { data: 'processType' }, { data: 'open' }
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
      dtInstance.columns.adjust();
    });
  }
  toggleSidebar() {
    this.sidebarService.compact('menu-sidebar');
    this.layoutService.changeLayoutSize();
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


  // Show progress bar
  showIssueStatus(status: string) {
    if (status.toLocaleUpperCase() === 'OPEN')
      return 25;
    else if (status.toLocaleUpperCase() === 'ON-GOING')
      return 50;
    else if (status.toLocaleUpperCase() === 'MONITORING')
      return 75;
    else if (status.toLocaleUpperCase() === 'CLOSED')
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

  openIssue(issueId: string) {
    console.log(issueId);
    this.router.navigate(['/pages/tables/create-issue', {'issueId': issueId}]);
  }
  newIssue() {
    this.router.navigate(['/pages/tables/create-issue', {'issueId': this.guidService.getGuid()}]);
  }

  testAdweb() {
    this.adwebService.camOnATung('e08nixwI4LicM21hAqBx82VlJWVKErAC').subscribe(result => console.log(result));
  }
}
