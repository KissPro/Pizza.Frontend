import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NbToastrService, NbWindowRef } from '@nebular/theme';
import { COOExportModel } from 'app/@core/models/coo-export';
import { DNModel } from 'app/@core/models/dn';
import { COOExportService } from 'app/@core/service/coo-export.service';
import { UploadService } from 'app/@core/service/upload-file.service';
import { ToastrComponent } from 'app/pages/modal-overlays/toastr/toastr.component';

@Component({
  selector: 'ngx-coo',
  templateUrl: './coo.component.html',
  styleUrls: ['./coo.component.scss'],
})
export class COOComponent implements OnInit {
  // Receive value
  listSelectedDN: DNModel[];
  shipFrom: string = null;
  cooNo: string = null;
  packageNo: string = null;
  type: string;

  // Variable
  alert = new ToastrComponent(this.toastrService);


  constructor(public windowRef: NbWindowRef,
    private uploadService: UploadService,
    private toastrService: NbToastrService,
    private exportCOO: COOExportService,
  ) { }

  ngOnInit(): void {
  }


  listRemoveDuplicate() {
    return this.listSelectedDN.filter(
      (dn, i, arr) => arr.findIndex(x => x.delivery === dn.delivery) === i,
    );
  }

  listRemoveDuplicateHscode() {
    return this.listSelectedDN.filter(
      (dn, i, arr) => arr.findIndex(x => x.harmonizationCode === dn.harmonizationCode) === i,
    );
  }


  checkValidInput() {
    if (this.shipFrom === '' || this.cooNo === '' || this.packageNo === ''
      || this.shipFrom === undefined || this.cooNo === undefined || this.packageNo === undefined
    )
      return false;
    else
      return true;
  }
  onSubmit() {
    // Get value - reload table

    const coo: COOExportModel = {
      dn: this.listSelectedDN,
      ship: this.shipFrom,
      cooNo: this.cooNo,
      packageNo: this.packageNo,
    };
    this.exportCOO.SaveCOO(coo)
      .subscribe(
        result => {
          this.alert.showToast('success', 'Success', 'Create COO successfully!');
          this.windowRef.close();
        },
        (error: HttpErrorResponse) => {
          console.log('save coo error' + error);
          this.alert.showToast('danger', 'Error', 'Create COO Error!');
        },
      );
  }

  onExport() {
    const coo: COOExportModel = {
      dn: this.listSelectedDN,
      ship: this.shipFrom,
      cooNo: this.cooNo,
      packageNo: this.packageNo,
    };
    this.exportCOO.ExportCOO(coo)
      .subscribe(
        result => this.uploadService.ShowFile(result, 'COO_Export_' + this.cooNo + '.xlsx'),
      );
  }
}


