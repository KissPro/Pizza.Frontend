import { formatDate, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { EventEmitter, Output } from '@angular/core';
import { Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { NbDialogService, NbToastrService } from '@nebular/theme';
import { ApprovalModel } from 'app/@core/models/issue-approval';
import { VerificationModel } from 'app/@core/models/issue-type';
import { Mail } from 'app/@core/models/mail';
import { AdwebService } from 'app/@core/service/adweb.service';
import { AuthenticationService } from 'app/@core/service/authentication.service';
import { GuidService } from 'app/@core/service/guid.service';
import { ApprovalService } from 'app/@core/service/issue-approval.service';
import { IssueService } from 'app/@core/service/issue.service';
import { MailService } from 'app/@core/service/mail.service';
import { PlantService } from 'app/@core/service/plant.service';
import { DialogApprovalComponent } from 'app/pages/modal-overlays/dialog/dialog-aproval/dialog-approvalcomponent';
import { DialogConfirmComponent } from 'app/pages/modal-overlays/dialog/dialog-confirm/dialog-confirm.component';
import { DialogUploadFileComponent } from 'app/pages/modal-overlays/dialog/dialog-upload-file/dialog-upload-file.component';
import { ToastrComponent } from 'app/pages/modal-overlays/toastr/toastr.component';
import { he } from 'date-fns/locale';
import { environment } from 'environments/environment';
import { LocalDataSource, DefaultEditor } from 'ng2-smart-table';

@Component({
  selector: 'ngx-close',
  templateUrl: './close.component.html',
  styleUrls: ['./close.component.scss']
})
export class CloseComponent implements OnInit {


  source: LocalDataSource;
  @Input() IssueID: any;
  @Input() IssueTitle: any;
  @Input() IssueCreator: any;
  @Input() ApprovalLv1: any;
  @Input() ApprovalLv2: any;
  @Input() IssueProcess: any;

  @Output() backStatus = new EventEmitter<any>();
  listApproval: ApprovalModel[] = [];
  listVerifi: VerificationModel[] = [];

  approvalLv1: any;
  approvalLv2: any;

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
      // ngrate: {
      //   title: 'NG Rate(%)',
      //   editor: {
      //     type: 'list',
      //     config: {
      //       selectText: 'Select...',
      //       list: [{ value: 'true', title: 'OK' }, { value: 'false', title: 'NG' }],
      //     },
      //   },
      // },
      ngrate: {
        title: 'NG Rate (%)',
        editable: false,
        addable: false,
      },
      judgment: {
        title: 'Judgment',
        editor: {
          type: 'list',
          config: {
            selectText: 'Select',
            list: [{ value: 'OK', title: 'OK' }, { value: 'NG', title: 'NG' }],
          },
        },
      },
      date: {
        title: 'Updated Date',
        valuePrepareFunction: (created) => {
          if (isNaN(Date.parse(created))) {
            return formatDate(new Date(), 'dd/MM/yyyy', 'en_US');
          } else
            // return this.datePipe.transform(new Date(created), 'MM/dd/yyyy');
            return formatDate(new Date(created), 'dd/MM/yyyy', 'en_US');
        },
        // editor: {
        //   type: 'custom',
        //   component: CustomInputEditorComponent,
        // },
        editable: true,
        addable: true,
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
    private adwebService: AdwebService,
    private userService: AuthenticationService,
    private guidService: GuidService,
    private dialogService: NbDialogService,
    private toastrService: NbToastrService,
    private issueService: IssueService,
    private approvalService: ApprovalService,
    private mailService: MailService,
  ) {
    this.source = new LocalDataSource();

  }
  async ngOnInit() {
    // Get 
    this.loadVerifyTable();
    this.loadListApproval();

    // Get head approval information
    this.approvalLv1 = await this.adwebService.getUserDetailByID(this.userService.token(), this.ApprovalLv1).toPromise();
    this.approvalLv2 = await this.adwebService.getUserDetailByID(this.userService.token(), this.ApprovalLv2).toPromise();;
    // this.approvalLv2 = await (await this.adwebService.getUserDetailByDepartment(this.userService.token(), "Assembly Operations")).toPromise();
  }

  // role: Initiator - Owner - Approver - Admin
  checkPermissionAcion(actionRole: string) {
    let userId = this.userService.userId();
    if (this.userService.listRole().indexOf("Hanoi_NBB_PIZZA_ADMIN") !== -1)
      return true;
    if (actionRole == 'Initiator' && userId.toUpperCase() == this.IssueCreator.toUpperCase())
      return true;
    else if (actionRole == 'Approval' 
        && (userId.toUpperCase() == this.ApprovalLv2.toUpperCase() || userId.toUpperCase() == this.ApprovalLv1.toUpperCase()))
      return true;
    else
      return false;
  }

  // Load verify table
  loadVerifyTable() {
    this.issueService.getListVerificationByIssueId(this.IssueID)
      .subscribe(result => {
        this.source.load(result);
        this.listVerifi = result;
      });
  }
  // show approval information
  loadListApproval() {
    this.approvalService.getListApprovalByIssueId(this.IssueID).subscribe(result => {
      this.listApproval = result;
    });
  }

  onCreateConfirm(event): void {
    const newId = this.guidService.getGuid();
    event.newData.id = newId;
    event.newData.ngrate = ((Number(event.newData.ngqty) / Number(event.newData.size)) * 100).toFixed(1);
    console.log(event.newData);
    const vefify = {
      'id': newId,
      'issueId': this.IssueID,
      'ponno': event.newData.ponno,
      'size': event.newData.size,
      'ngqty': event.newData.ngqty,
      'ngrate': event.newData.ngrate,
      'judgment': event.newData.judgment,
      'date': new Date(event.newData.date),
    };

    // Create verify
    this.issueService.createVerification(vefify)
      .subscribe(result => {
        console.log(result);
        this.alert.showToast('success', 'Success', 'Create verification successfully!');
        // Update issue status
        this.issueService.getIssueById(this.IssueID).subscribe(result => {
          result.issueStatus = 'Monitoring';
          result.currentStep = (result.currentStep == 'Capa') ? 'Close' : result.currentStep;
          this.issueService.createIssue(result).subscribe(resultCreate => console.log(resultCreate));
        })
        // Show data -> local source
        event.confirm.resolve(event.newData);
      });
  }

  updateRate() {
    let size = $('td:nth-child(3) > ng2-smart-table-cell > table-cell-edit-mode > div > table-cell-default-editor > div > input-editor > input').val();
    let ngQty = $('td:nth-child(4) > ng2-smart-table-cell > table-cell-edit-mode > div > table-cell-default-editor > div > input-editor > input').val();
    let rate = $('td:nth-child(5) > ng2-smart-table-cell > table-cell-edit-mode > div > table-cell-default-editor > div > input-editor > input');
    // Set rate
    rate.val(((Number(ngQty) / Number(size)) * 100).toFixed(1));
  }

  onSaveConfirm(event): void {
    event.newData.ngrate = ((Number(event.newData.ngqty) / Number(event.newData.size)) * 100).toFixed(1);
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
    this.issueService.createVerification(vefify)
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
          this.issueService.removeVerification(id)
            .subscribe(() => {
              this.alert.showToast('success', 'Success', 'Delete the config successfully!');
              event.confirm.resolve();
            });
        } else {
          event.confirm.reject();
        }
      });
  }

  openApproval() {
    this.dialogService.open(DialogApprovalComponent)
      .onClose.subscribe(resultApproval => {
        if (resultApproval) {
          // Approval information
          const approval: ApprovalModel = {
            id: this.guidService.getGuid(),
            issueNo: this.IssueID,
            approverId: this.userService.userName(),
            team: this.userService.team(),
            action: (resultApproval.status == 1) ? 'Approval' : 'Reject',
            approverRemark: resultApproval.remark,
            updatedBy: this.userService.userId(),
            updatedDate: new Date(),
          }
          this.approvalService.insertOrUpdate(approval).subscribe(result => {
            if (result) this.alert.showToast('success', 'Success', 'Insert/Update approval sucessfully!');

            // Send mail
            // If approver from Lv1 -> send new approval Lv2  
            // Process: OBA - 2 level
            ///         IT  - 1 level
            if (this.approvalLv1.work_email == this.userService.email() 
                 && resultApproval.status == 1
                 && (this.IssueProcess === 'OBA' || this.IssueProcess === 'CAPA')) {
              this.sendMailApproval(this.approvalLv2);
            }

            // If approval from lv2 -> update issue status
            if (this.approvalLv2.work_email == this.userService.email() 
                && resultApproval.status == 1
                || this.IssueProcess == 'IT') {
              this.issueService.getIssueById(this.IssueID).subscribe(result => {
                // Update issue information 
                result.issueStatus = 'Done';
                result.currentStep = 'Close';
                this.issueService.createIssue(result).subscribe(resultCreate => {
                  if (resultCreate == true) {
                    this.alert.showToast('success', 'Success', 'Create/Update assign successfully!');
                  }
                })
              })
            }
            // Send mail notification -> Initiator
            this.sendApproved(approval);
            this.loadListApproval();
          })
        }
      });
  }

  // Approval callback
  async sendApproved(approval: ApprovalModel) {
    let initiatorMail = await this.adwebService.getUserDetailByID(this.userService.token(), this.IssueCreator).toPromise();
    const mail: Mail = {
      sender: 'Pizza Systems',
      to: initiatorMail['work_email'],
      cc: '',
      bcc: '',
      subject: 'Approval Notification-' + this.IssueTitle,
      content:
        "Dear Mr/Ms. " + initiatorMail['ad_user_displayName'] + ",</br></br>" +
        "You have received a an approval notification from " + this.userService.userName() + " in Pizza system.</br>" +
        "Approval result: " + approval.action + "</br>" +
        "Remark: " + approval.approverRemark + "</br>" +
        "Please follow below link to view : <a href='" + environment.clientUrl + "/pages/tables/create-issue;issueId=" + this.IssueID + ";type=open;step=openIssue" + "'>Pizza - Open Issue</a></br></br>" +
        "Best regards," +
        "</br><a href='" + environment.clientUrl + "'>Pizza System</a></br>"
    }
    this.mailService.SendMail(mail).subscribe(result => result ? console.log('send mail successfully!') : console.log('send mail error!'));
  }
  async sendMailApproval(headInfor: any) {
    // Send mail to approval lv1
    let initiatorMail = await this.adwebService.getUserDetailByID(this.userService.token(), this.IssueCreator).toPromise();
    const mail: Mail = {
      sender: 'Pizza Systems',
      to: headInfor['work_email'],
      cc: '',
      bcc: initiatorMail['work_email'],
      subject: 'Approval Request-' + this.IssueTitle,
      content:
        "Dear Mr/Ms. " + headInfor.ad_user_displayName + ",</br></br>" +
        "You have received an approval request from " + this.userService.userName() + " in Pizza system.</br>" +
        "Please follow below link to view : <a href='" + environment.clientUrl + "/pages/tables/create-issue;issueId=" + this.IssueID + ";type=open;step=openIssue" + "'>Pizza - Open Issue</a></br></br>" +
        "Best regards," +
        "</br><a href='" + environment.clientUrl + "'>Pizza System</a></br>"
    }
    this.mailService.SendMail(mail).subscribe(result => result ? console.log('send mail successfully!') : console.log('send mail error!'));
    // Create approval in-review
    const approval: ApprovalModel = {
      id: this.guidService.getGuid(),
      issueNo: this.IssueID,
      approverId: headInfor.ad_user_displayName,
      team: headInfor.job_title,
      action: 'In Review',
      approverRemark: null,
      updatedBy: this.userService.userId(),
      updatedDate: new Date(),
    }
    this.approvalService.insertOrUpdate(approval).toPromise();
  }

  BackStep() {
    this.backStatus.emit('capa');
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
    return formatDate(new Date(), 'dd/MM/yyyy', 'en_US');
  }
}