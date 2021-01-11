import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { NbSidebarService, NbToastrService, NbWindowService } from '@nebular/theme';
import { LayoutService } from 'app/@core/utils';
import { DNManualModel, DNModel } from 'app/@core/models/dn';
import { DNService } from 'app/@core/service/dn.service';
import { COOComponent } from 'app/pages/forms/coo/coo.component';
import { ToastrComponent } from 'app/pages/modal-overlays/toastr/toastr.component';
import { DNMComponent } from 'app/pages/tables/dn/dnm.component';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { UploadService } from 'app/@core/service/upload-file.service';


@Component({
  selector: 'ngx-dn',
  templateUrl: 'dn.component.html',
  styleUrls: ['dn.component.scss'],
})
export class DNComponent implements OnInit, AfterViewInit, OnDestroy {

  // Datatable parameter
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  dtTrigger: Subject<any> = new Subject();

  // Variable
  dns: DNModel[];
  indexTable: number;
  dnsManual: DNManualModel[];
  indexTable2: number;
  selectedDN?: DNModel;
  listSelectDN: DNModel[] = [];
  alert = new ToastrComponent(this.toastrService);
  changeValue: string;

  // Pass to coo form
  shipFrom: string;
  cooNo: string;
  packageNo: string;
  type: string = 'add';


  constructor(private http: HttpClient,
    private dnService: DNService,
    private sidebarService: NbSidebarService,
    private windowService: NbWindowService,
    private toastrService: NbToastrService,
    private uploadService: UploadService,
    private layoutService: LayoutService) { }

  toggleSidebar() {
    this.sidebarService.compact('menu-sidebar');
    this.layoutService.changeLayoutSize();
  }

  ngOnInit(): void {
    this.toggleSidebar();

    this.loadIncomingTable();
  }
  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  loadIncomingTable() {
    // Incoming Table
    this.dtOptions[0] = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: true,
      scrollX: true,
      scrollY: '62vh',
      order: [2, 'asc'],

      ajax: (dataTablesParameters: any, callback) => {
        this.dnService.getDN(dataTablesParameters)
          .subscribe(resp => {
            this.dns = resp.data;
            this.indexTable = resp.start;
            callback({
              recordsTotal: resp.recordsTotal,
              recordsFiltered: resp.recordsFiltered,
              data: [],
            });
          });
      },
      columns: [
        { data: 'index' }, { data: 'invoiceNo' }, { data: 'delivery' }, { data: 'invoiceNo' },
        { data: 'materialParent' }, { data: 'materialDesc' },
        { data: 'shipToCountryName' }, { data: 'hmdShipToCode' }, { data: 'partyName' },
        { data: 'customerInvoiceNo' }, { data: 'saleUnit' },
        { data: 'actualGidate' }, { data: 'netValue' }, { data: 'dnqty' }, { data: 'netPrice' },
        { data: 'harmonizationCode' }, { data: 'address' }, { data: 'address' },
        { data: 'address' }, { data: 'address' }, { data: 'plant' }, { data: 'planGidate' },
        { data: 'planGisysDate' }, { data: 'insertedDate' }, { data: 'updatedDate' },
      ],
      columnDefs: [
        { targets: 'no-sort', orderable: false },
      ],
    };
  }

  reloadIncomingTable() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }
  // Thao tác với table
  currentRow; // Hight light this line
  selectedRow(event, i, dn: DNModel) {
    if (!this.listSelectDN.find(x => x.delivery === dn.delivery
      && x.invoiceNo === dn.invoiceNo
      && x.materialParent === dn.materialParent)) {
      // add to list
      this.listSelectDN.push(dn);
      this.currentRow = i; // hightlight
    } else {
      this.listSelectDN.splice(this.listSelectDN.indexOf(dn), 1);
      this.currentRow = undefined;
    }
  }

  openCreateCOO() {
    // list DN name
    const listDNName = this.listSelectDN.map(x => x.delivery.toString()).join(',');

    // Check address unique
    const checkUnique = [...new Set(this.listSelectDN.map(x => x.address))];
    if (checkUnique.length !== 1) {
      this.alert.showToast('danger', 'Error', 'Adress must be unique!');
      return;
    }
    this.windowService.open(COOComponent,
      {
        title: `COO Report Information | DN: ` + listDNName,
        context: {
          listSelectedDN: this.listSelectDN,
          shipFrom: this.shipFrom,
          cooNo: this.cooNo,
          packageNo: this.packageNo,
          type: this.type,
        },
      }).onClose.subscribe(
        () => {
          this.loadIncomingTable();
          this.reloadIncomingTable();
          // Clear selected
          this.listSelectDN = [];
          this.shipFrom = undefined;
          this.cooNo = undefined;
          this.packageNo = undefined;
          this.type = 'add';
          // update child table - coo manual
          this.changeValue = 'update-table-' + Date.now().toString();
        },
      );
  }

  openCOOCreated(dnm: DNManualModel) {
    this.shipFrom = dnm.shipFrom;
    this.cooNo = dnm.coono;
    this.packageNo = dnm.package;
    this.type = 'update';
    // set list dn
    this.dnService.getListDNCOO(this.cooNo)
      .subscribe(result => {
        console.log(result);
        this.listSelectDN = result;
        this.openCreateCOO();
      });
  }

  downloadDN() {
    this.dnService.DownloadDN()
      .subscribe(
        result => this.uploadService.ShowFile(result, 'Download_DN_' + new Date().toLocaleString()),
      );
  }

  // Select DN to export COO
  checkList(dn: DNModel) {
    if (!this.listSelectDN.find(x => x.delivery === dn.delivery
      && x.invoiceNo === dn.invoiceNo
      && x.materialParent === dn.materialParent)) {
      // add to list
      return false;
    } else
      return true;
  }
  checkuncheckall() {
    if (this.listSelectDN === this.dns) {
      this.listSelectDN = [];
    } else {
      this.listSelectDN = this.dns;
    }
  }
}
