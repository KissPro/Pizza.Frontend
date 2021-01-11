import { AfterContentChecked, AfterViewChecked, AfterViewInit, Component, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { NbSidebarService } from '@nebular/theme';
import { LayoutService } from 'app/@core/utils';
import { BoomEcusModel } from 'app/@core/models/boom-ecus';
import { BoomEcusService } from 'app/@core/service/boom-ecus.service';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { UploadService } from 'app/@core/service/upload-file.service';



@Component({
  selector: 'ngx-boom-ecus',
  templateUrl: 'boom-ecus.component.html',
  styleUrls: ['boom-ecus.component.scss'],
})
export class BoomEcusComponent implements OnInit, AfterViewInit, OnDestroy {
  dtOptions: DataTables.Settings = {};
  boomEcus: BoomEcusModel[];
  dtTrigger: Subject<any> = new Subject();
  indexTable: number;
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;

  constructor(private http: HttpClient,
    private boomEcusService: BoomEcusService,
    private uploadService: UploadService,
    private sidebarService: NbSidebarService,
    private layoutService: LayoutService) { }

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
      scrollY: '65vh', // hight data
      order: [1, 'asc'],

      ajax: (dataTablesParameters: any, callback) => {
        that.boomEcusService.getBoomEcus(dataTablesParameters)
          .subscribe(resp => {
            that.boomEcus = resp.data;
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
        { data: 'index' }, { data: 'plant' }, { data: 'parentMaterial' },
        { data: 'level' }, { data: 'item' }, { data: 'tenHang' },
        { data: 'maHS' }, { data: 'quantity' }, { data: 'donGiaHd' }, { data: 'country' },
        { data: 'soTk' }, { data: 'ngayDk' }, { data: 'altGroup' }, { data: 'sortString' },
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

  downloadBoomEcus() {
    console.log(1);
    this.boomEcusService.downloadBoomEcus()
    .subscribe(
      result => this.uploadService.ShowFile(result, 'Download_BoomEcus_' + new Date().toLocaleString()),
    );
  }

  // hideColumn() {
  //   this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
  //     const column = dtInstance.column(1);
  //     column.visible( ! column.visible() );
  //   });
  //   // this.rerender();
  // }
}
