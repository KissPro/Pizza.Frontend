import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { DefaultEditor, LocalDataSource } from 'ng2-smart-table';
import { AuthenticationService } from 'app/@core/service/authentication.service';
import { GuidService } from 'app/@core/service/guid.service';
import { formatDate } from '@angular/common';
import { NbDialogService, NbToastrService } from '@nebular/theme';
import { ToastrComponent } from 'app/pages/modal-overlays/toastr/toastr.component';
import { DialogConfirmComponent } from 'app/pages/modal-overlays/dialog/dialog-confirm/dialog-confirm.component';
import { ConfigService } from 'app/@core/service/config.service';

@Component({
  selector: 'ngx-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss']
})
export class ConfigComponent {
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
      key: {
        title: 'Key',
        type: 'string',
      },
      value: {
        title: 'Value',
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
      remarkconfig: {
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
    private serviceConfig: ConfigService,
    private authen: AuthenticationService,
    private guidService: GuidService,
    private dialogService: NbDialogService,
    private toastrService: NbToastrService) {
    this.source = new LocalDataSource();
    this.serviceConfig.getAllConfig()
      .subscribe(result => {
        this.source.load(result);
      });
  }

  onCreateConfirm(event): void {
    const newId = this.guidService.getGuid();
    event.newData.id = newId;
    const config = {
      'id': newId,
      'key': event.newData.key,
      'value': event.newData.value,
      'updatedBy': this.authen.userName(),
      'updatedDate': new Date(),
      'remarkConfig': event.newData.remarkConfig,
    };

    console.log(config);
    this.serviceConfig.createConfig(config)
      .subscribe(result => {
        console.log(result);
        this.alert.showToast('success', 'Success', 'Create config successfully!');
        // Show data -> local source
        event.confirm.resolve(event.newData);
      },
        (err: HttpErrorResponse) => {
          this.alert.showToast('danger', 'Error', 'Create config error!');
          if (err.error instanceof Error) {
            console.log('Client-side error occured.');
          } else {
            console.log('Server-side error occured.');
          }
        },
      );
  }

  onSaveConfirm(event): void {
    const config = {
      'id': event.newData.id,
      'key': event.newData.key,
      'value': event.newData.value,
      'updatedBy': this.authen.userName(),
      'updatedDate': new Date(),
      'remarkConfig': event.newData.remarkConfig,
    };
    const id = event.newData.id;
    this.serviceConfig.editConfig(id, config)
      .subscribe(() => {
        this.alert.showToast('success', 'Success', 'Update config successfully!');
        event.confirm.resolve(event.newData);
      },
        (err: HttpErrorResponse) => {
          this.alert.showToast('danger', 'Error', 'Update the config error!');
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
          this.serviceConfig.deleteConfig(id)
            .subscribe(() => {
              this.alert.showToast('success', 'Success', 'Delete the config successfully!');
              event.confirm.resolve();
            },
              (err: HttpErrorResponse) => {
                this.alert.showToast('danger', 'Error', 'Delete the config error!');
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
