import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { CountryShipService } from 'app/@core/service/country-ship.service';
import { DefaultEditor, LocalDataSource, ServerDataSource } from 'ng2-smart-table';
import { AuthenticationService } from 'app/@core/service/authentication.service';
import { GuidService } from 'app/@core/service/guid.service';
import { formatDate } from '@angular/common';
import { NbDialogService, NbToastrService } from '@nebular/theme';
import { ToastrComponent } from 'app/pages/modal-overlays/toastr/toastr.component';
import { DialogConfirmComponent } from 'app/pages/modal-overlays/dialog/dialog-confirm/dialog-confirm.component';
import { DialogUploadFileComponent } from 'app/pages/modal-overlays/dialog/dialog-upload-file/dialog-upload-file.component';

@Component({
  selector: 'ngx-country-ship',
  templateUrl: './country-ship.component.html',
  styleUrls: ['./country-ship.component.scss'],
})
export class CountryShipComponent {
  source: LocalDataSource;
  alert = new ToastrComponent(this.toastrService);

  // Setting is setting table
  settings = {
    add: {
      addButtonContent: '<i class="nb-plus"></i>',
      createButtonContent: '<i class="nb-checkmark"></i>',
      cancelButtonContent: '<i class="nb-close"></i>',
      confirmCreate: true,
    },
    edit: {
      editButtonContent: '<i class="nb-edit"></i>',
      saveButtonContent: '<i class="nb-checkmark"></i>',
      cancelButtonContent: '<i class="nb-close"></i>',
      confirmSave: true,
    },
    delete: {
      deleteButtonContent: '<i class="nb-trash"></i>',
      confirmDelete: true,
    },
    columns: {
      hmdShipToCode: {
        title: 'HMD Ship Code',
        type: 'string',
      },
      hmdShipToParty: {
        title: 'HMD Ship Party',
        type: 'string',
      },
      shipToCountryCode: {
        title: 'Country Code',
        type: 'string',
      },
      shipToCountryName: {
        title: 'Country Name',
        type: 'string',
      },
      updatedDate: {
        title: 'Updated Date',
        valuePrepareFunction: (created) => {
          if (isNaN(Date.parse(created))) {
            return formatDate(new Date(), 'MM/dd/yyyy', 'en_US');
          } else
            // return this.datePipe.transform(new Date(created), 'MM/dd/yyyy');
            return formatDate(new Date(created), 'MM/dd/yyyy', 'en_US');
        },
        editor: {
          type: 'custom',
          component: CustomInputEditorComponent,
        },
      },
      remarkCountry: {
        title: 'Remark',
        type: 'string',
      },
      id: {
        title: 'Id',
        valuePrepareFunction: (created) => created.substring(0, 8),
        editable: false,
        addable: false,
      },
    },
  };

  constructor(
    private serviceCountry: CountryShipService,
    private authen: AuthenticationService,
    private guidService: GuidService,
    private dialogService: NbDialogService,
    private toastrService: NbToastrService) {
    this.source = new LocalDataSource();
    this.LoadTable();
  }

  LoadTable() {
    this.serviceCountry.getAllCountryShip()
    .subscribe(result => {
      this.source.load(result);
    });
  }

  onCreateConfirm(event): void {
    const newId = this.guidService.getGuid();
    event.newData.id = newId;
    const country = {
      'id': newId,
      'hmdShipToCode': event.newData.hmdShipToCode,
      'hmdShipToParty': event.newData.hmdShipToParty,
      'shipToCountryCode': event.newData.shipToCountryCode,
      'shipToCountryName': event.newData.shipToCountryName,
      'updatedBy': this.authen.userName(),
      'updatedDate': new Date(),
      'remarkCountry': event.newData.remarkCountry,
    };
    console.log(country);
    this.serviceCountry.createCountryShip(country)
      .subscribe(result => {
        console.log(result);
        this.alert.showToast('success', 'Success', 'Create country ship successfully!');
        event.confirm.resolve(event.newData);
      },
        (err: HttpErrorResponse) => {
          this.alert.showToast('danger', 'Error', 'Create country ship error!');
          if (err.error instanceof Error) {
            console.log('Client-side error occured.');
          } else {
            console.log('Server-side error occured.');
          }
        },
      );
  }

  onSaveConfirm(event): void {
    const country = {
      'id': event.newData.id,
      'hmdShipToCode': event.newData.hmdShipToCode,
      'hmdShipToParty': event.newData.hmdShipToParty,
      'shipToCountryCode': event.newData.shipToCountryCode,
      'shipToCountryName': event.newData.shipToCountryName,
      'updatedBy': this.authen.userName(),
      'updatedDate': new Date(),
      'remarkCountry': event.newData.remarkCountry,
    };
    const id = event.newData.id;
    this.serviceCountry.editCountryShip(id, country)
      .subscribe(result => {
        this.alert.showToast('success', 'Success', 'Update country ship successfully!');
        event.confirm.resolve(event.newData);
      },
        (err: HttpErrorResponse) => {
          this.alert.showToast('danger', 'Error', 'Update the country ship error!');
          if (err.error instanceof Error) {
            console.log('Client-side error occured.');
          } else {
            console.log('Server-side error occured.');
          }
        },
      );
  }

  onDeleteConfirm(event): void {
    this.dialogService.open(DialogConfirmComponent)
      .onClose.subscribe(result => {
        if (result === 1) {
          const id = event.data.id;
          this.serviceCountry.deleteCountryShip(id)
            .subscribe(() => {
              this.alert.showToast('success', 'Success', 'Delete the country ship successfully!');
              event.confirm.resolve();
            },
              (err: HttpErrorResponse) => {
                this.alert.showToast('danger', 'Error', 'Delete the country ship error!');
                event.confirm.reject();
                if (err.error instanceof Error) {
                  console.log('Client-side error occured.');
                } else {
                  console.log('Server-side error occured.');
                }
              },
            );
        } else {
          event.confirm.reject();
        }
      });
  }

  // upload file
  uploadFile(): void {
    this.dialogService.open(DialogUploadFileComponent, {
      context: {
        type: 'CountryShip',
        templateName: 'CountryShip_Template.xlsx',
        urlUpload: '/api/country/import-excel',
      },
    }).onClose.subscribe(result => (result === 'success') ? this.LoadTable() : null);
  }
}

// Custome input
@Component({
  selector: 'ngx-input-editor',
  template: `
    <input type="text" value="{{ getDate()}}" class="form-control" readonly/>
  `,
})
export class CustomInputEditorComponent extends DefaultEditor {
  constructor(public datePipe: DatePipe) {
    super();
  }
  getDate() {
    return formatDate(new Date(), 'MM/dd/yyyy', 'en_US');
  }
}
