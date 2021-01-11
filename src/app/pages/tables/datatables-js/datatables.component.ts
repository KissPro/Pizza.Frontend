import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { NbSidebarService } from '@nebular/theme';
import { LayoutService } from 'app/@core/utils';
import { COOService } from 'app/@core/mock/coo.service';
import { COOModel } from 'app/@core/data/coo-model';



@Component({
  selector: 'ngx-datatables',
  templateUrl: 'datatables.component.html',
  styleUrls: ['datatables.component.scss'],
})
export class DataTablesComponent implements OnInit {
  dtOptions: DataTables.Settings = {};
  persons: COOModel[];

  constructor(private http: HttpClient,
    private cooService: COOService,
    private sidebarService: NbSidebarService,
    private layoutService: LayoutService) {}

  ngOnInit(): void {
    const that = this;
    const headers = new HttpHeaders().set('Content-Type', 'application/json');

    this.toggleSidebar();
    this.dtOptions[0] = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: true,
      ajax: (dataTablesParameters: any, callback) => {
        that.cooService.postDatatables(dataTablesParameters)
          .subscribe(resp => {
            that.persons = resp.data;
            callback({
              recordsTotal: resp.recordsTotal,
              recordsFiltered: resp.recordsFiltered,
              data: [],
            });
          });
      },
      columns: [{ data: 'maHS' }, {data: 'quantity' }, { data: 'donGiaHD' }, { data: 'item' }],
    };
  }

  toggleSidebar(): boolean {
    this.sidebarService.toggle(true, 'menu-sidebar');
    this.layoutService.changeLayoutSize();

    return false;
  }
}
