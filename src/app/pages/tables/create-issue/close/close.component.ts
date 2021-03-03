import { formatDate, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { EventEmitter, Output } from '@angular/core';
import { Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { NbDialogService, NbToastrService } from '@nebular/theme';
import { AuthenticationService } from 'app/@core/service/authentication.service';
import { GuidService } from 'app/@core/service/guid.service';
import { IssueService } from 'app/@core/service/issue.service';
import { PlantService } from 'app/@core/service/plant.service';
import { DialogConfirmComponent } from 'app/pages/modal-overlays/dialog/dialog-confirm/dialog-confirm.component';
import { DialogUploadFileComponent } from 'app/pages/modal-overlays/dialog/dialog-upload-file/dialog-upload-file.component';
import { ToastrComponent } from 'app/pages/modal-overlays/toastr/toastr.component';
import { LocalDataSource, DefaultEditor } from 'ng2-smart-table';

@Component({
  selector: 'ngx-close',
  templateUrl: './close.component.html',
  styleUrls: ['./close.component.scss']
})
export class CloseComponent implements OnInit {


  source: LocalDataSource;
  @Input() IssueID: any;
  @Output() backStatus = new EventEmitter<any>();



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
      ponno: {
        title: 'PON No',
        type: 'string',
      },
      size: {
        title: 'Size',
        type: 'number',
      },
      ngqty: {
        title: "NG Q'ty",
        type: 'number',
      },
      ngrate: {
        title: 'NG Rate',
        type: 'string',
      },
      judgment: {
        title: 'Judgment',
        type: 'string',
      },
      date: {
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
      id: {
        title: 'Id',
        valuePrepareFunction: (created) => created.substring(0, 8),
        editable: false,
        addable: false,
      },
    },
  };

  constructor(
    private plantConfig: PlantService,
    private authen: AuthenticationService,
    private guidService: GuidService,
    private dialogService: NbDialogService,
    private toastrService: NbToastrService,
    private isssueService: IssueService,

  ) {
    this.source = new LocalDataSource();
  }
  ngOnInit(): void {
    this.LoadTable();
  }

  LoadTable() {
    this.isssueService.getListVerificationByIssueId(this.IssueID)
      .subscribe(result => {
        this.source.load(result);
      });
  }

  onCreateConfirm(event): void {
    const newId = this.guidService.getGuid();
    event.newData.id = newId;
    const vefify = {
      'id': newId,
      'issueId': this.IssueID,
      'ponno': event.newData.ponno,
      'size': event.newData.size,
      'ngqty': event.newData.ngqty,
      'ngrate': event.newData.ngrate,
      'judgment': event.newData.judgment,
      'date': new Date(),
    };
    console.log(vefify);
    this.isssueService.createVerification(vefify)
      .subscribe(result => {
        console.log(result);
        this.alert.showToast('success', 'Success', 'Create verification successfully!');
        // Show data -> local source
        event.confirm.resolve(event.newData);
      });
  }

  onSaveConfirm(event): void {
    const vefify = {
      'id': event.newData.id,
      'issueId': this.IssueID,
      'ponno': event.newData.ponno,
      'size': event.newData.size,
      'ngqty': event.newData.ngqty,
      'ngrate': event.newData.ngrate,
      'judgment': event.newData.judgment,
      'date': new Date(),
    };
    const id = event.newData.id;
    this.isssueService.createVerification(vefify)
      .subscribe(result => {
        console.log(result);
        this.alert.showToast('success', 'Success', 'Create verification successfully!');
        // Show data -> local source
        event.confirm.resolve(event.newData);
      });
  }

  onDeleteConfirm(event): void {
    this.dialogService.open(DialogConfirmComponent)
      .onClose.subscribe(result => {
        if (result === 1) {
          const id = event.data.id;
          this.isssueService.removeVerification(id)
            .subscribe(() => {
              this.alert.showToast('success', 'Success', 'Delete the config successfully!');
              event.confirm.resolve();
            });
        } else {
          event.confirm.reject();
        }
      });
  }

  // upload file
  uploadFile(): void {
    this.dialogService.open(DialogUploadFileComponent, {
      context: {
        type: 'Plant',
        templateName: 'Plant_Template.xlsx',
        urlUpload: '/api/plant/import-excel',
      },
    }).onClose.subscribe(result => (result === 'success') ? this.LoadTable() : null);
  }

  BackStep() {
    this.backStatus.emit('openIssue');
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
