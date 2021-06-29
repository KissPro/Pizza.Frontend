import { Input, QueryList, ViewChildren } from '@angular/core';
import { ChangeDetectorRef, EventEmitter, Output, TemplateRef } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbToastrService, NbDialogService } from '@nebular/theme';
import { AssignModel, ExtendDLModel } from 'app/@core/models/assign';
import { Mail } from 'app/@core/models/mail';
import { AdwebService } from 'app/@core/service/adweb.service';
import { AssginService } from 'app/@core/service/assign.service';
import { AuthenticationService } from 'app/@core/service/authentication.service';
import { GuidService } from 'app/@core/service/guid.service';
import { IssueService } from 'app/@core/service/issue.service';
import { MailService } from 'app/@core/service/mail.service';
import { ToastrComponent } from 'app/pages/modal-overlays/toastr/toastr.component';
import { format } from 'date-fns';
import { environment } from 'environments/environment';

@Component({
  selector: 'ngx-capa',
  templateUrl: './capa.component.html',
  styleUrls: ['./capa.component.scss']
})
export class CapaComponent implements OnInit {

  // Init
  alert = new ToastrComponent(this.toastrService);



  @Input() Hearder: any;
  @Input() CurrentStep: any;
  @Input() Next: any;
  @Input() Back: any;

  @Input() IssueID: any;
  @Input() IssueTitle: any;
  @Input() IssueCreator: any;
  @Input() ApprovalLv1: any;
  @Input() ApprovalLv2: any;

  @Output() nextStatus = new EventEmitter<any>();
  @Output() backStatus = new EventEmitter<any>();

  listDeadline: ExtendDLModel[] = [];
  inputOwner = '';
  // IssueID = '2D864EC3-3DBC-4C06-BC12-31E50D880B16';


  // list item
  @ViewChildren('item') item: QueryList<any>;

  constructor(
    private formBuilder: FormBuilder,
    private adwebService: AdwebService,
    private toastrService: NbToastrService,
    private mailService: MailService,
    private userService: AuthenticationService,
    private dialogService: NbDialogService,
    private assignService: AssginService,
    private guidService: GuidService,
    private issueService: IssueService,
    private ref: ChangeDetectorRef,
  ) { }


  ngOnInit(): void {
    this.showListAssign();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.item.forEach(element => {
        element.toggle();
      });
    }, 1);
  }


  //#region CHECK PERMISSON
  checkPermissionShow(ownerId: string) {
    let userId = this.userService.userId();
    if ((ownerId && userId.toUpperCase() == ownerId.toUpperCase())
      // initiator role
      || userId.toUpperCase() == (this.IssueCreator && this.IssueCreator.toUpperCase())
      // admin role
      || this.userService.listRole().indexOf("Hanoi_NBB_PIZZA_ADMIN") !== -1
      || this.userService.listRole().indexOf("Hanoi_NBB_PIZZA_CONTROLLER") !== -1
      // approval role
      || userId.toUpperCase() == this.ApprovalLv1.toUpperCase() || userId.toUpperCase() == this.ApprovalLv2.toUpperCase()
    )
      return true;
    return false;
  }
  // role: Initiator - Owner - Approver - Admin
  checkPermissionAcion(ownerId: string, actionRole: string) {
    let userId = this.userService.userId();
    if (this.userService.listRole().indexOf("Hanoi_NBB_PIZZA_ADMIN") !== -1 || this.userService.listRole().indexOf("Hanoi_NBB_PIZZA_CONTROLLER") !== -1)
      return true;
    if (actionRole == 'Initiator' && userId.toUpperCase() == (this.IssueCreator && this.IssueCreator.toUpperCase()))
      return true;
    else if (actionRole == 'Owner' && (ownerId && userId.toUpperCase() == ownerId.toUpperCase()))
      return true;
    else
      return false;
  }
  checkRoleByType(type: string) {
    let initAction = ['draft', 'assign'];
    let ownerAction = ['submit-draft', 'submit'];
    if (initAction.includes(type.toLowerCase()))
      return 'Initiator';
    else if (ownerAction.includes(type.toLowerCase()))
      return 'Owner';
    else
      return '';
  }
  //#endregion


  showListAssign() {
    this.listAssign().clear();
    this.assignService.getListAssign(this.IssueID).subscribe(result => {
      result.forEach((item) => {
        if (item.currentStep === this.CurrentStep)
          this.listAssign().push(this.initAssign(item))
      });
    });
  }
  showListDeadLine(assignId: string) {
    this.listDeadline = [];
    this.assignService.getListDeadLine(assignId).subscribe(result => {
      result.forEach((item) => this.listDeadline.push(item));
    });
  }

  //#region Assign
  createAssignFormGroup: FormGroup = this.formBuilder.group({
    assignList: this.formBuilder.array([])
  });

  listAssign(): FormArray {
    return this.createAssignFormGroup.get("assignList") as FormArray;
  }
  checkAssignDone() {
    for (let assignList of this.listAssign().controls) {
      const result = assignList.value.status;
      if (result == 'Done')
        return true;
    }
    return false;
  }

  initAssign(assign: AssignModel) {
    return this.formBuilder.group({
      id: assign.id,
      ownerId: assign.ownerId,
      name: assign.name,
      email: assign.email,
      team: assign.team,
      requestContent: assign.requestContent,
      deadLine: new Date(assign.deadLine),
      deadLineTime: format(new Date(assign.deadLine), 'HH:mm'),
      actionContent: assign.actionContent,
      actionDate: assign.actionDate,
      assignedDate: assign.assignedDate,
      status: assign.status,
      scheduleDeadLine: assign.scheduleDeadLine,
      remark: assign.remark,
    })
  }

  newAssign(id: string, name: string, email: string, team: string): FormGroup {
    this.inputOwner = ''; // reset input textbox
    return this.formBuilder.group({
      ownerId: id,
      name: name,
      email: email,
      team: team,
      requestContent: ['', [Validators.required]],
      deadLine: ['', [Validators.required]],
      deadLineTime: ['', [Validators.required]],
      actionContent: '',
      actionDate: null,
      assignedDate: new Date(),
      status: 'Draft',
      remark: '',
    })
  }
  addNewAssign(idMail: string) {
    // Get information
    var token = JSON.parse(localStorage.getItem('user')).token["access_token"];
    this.adwebService.getUserDetailByEmail(token, idMail).subscribe(result => {
      if (result != null) {
        this.listAssign().push(this.newAssign(result['ad_user_employeeID'], result['ad_user_displayName']
          , result['work_email'], result['department_id'][1]));
      }
      else {
        this.adwebService.getUserDetailByID(token, idMail).subscribe(result => {
          if (result != null) {
            this.listAssign().push(this.newAssign(result['ad_user_employeeID'], result['ad_user_displayName']
              , result['work_email'], result['department_id'][1]));
          }
          else {
            this.alert.showToast('danger', 'Error', 'This id or email not exists in the system!');
          }
        });
      }
    });
  }

  // Richtext information
  updateRickText(index: number, value: string) {
    this.listAssign().at(index).patchValue({ actionContent: value })
  }

  removeAssign(index: number, assign: any) {
    // remove in list
    this.listAssign().removeAt(index);
    // remove in server
    if (assign.id != null)
      this.assignService.removeAssign(assign.id).subscribe(result => {
        if (result == true) {
          this.alert.showToast('success', 'Success', 'Remove assign successfully!');

          // send mail cancel assign
          // Send first email  
          const mail: Mail = {
            sender: 'Pizza Systems',
            to: assign.email,
            cc: '',
            bcc: this.userService.email(),
            subject: 'Cancel-Assignment-Notification' + this.IssueTitle,
            content:
              "Dear Mr/Ms. " + assign.name + ",</br></br>" +
              "You have received a Cancel Assignment Notification in Pizza system.</br>" +
              "you would not need to fulfill data for this request anymore</br>" +
              "Please follow below link to view : <a href='" + environment.clientUrl + "/pages/tables/create-issue;issueId=" + this.IssueID + ";type=open;step=" + this.CurrentStep + "'>Pizza - Open Issue</a></br></br>" +
              "Best regards," +
              "</br><a href='" + environment.clientUrl + "'>Pizza System</a></br>"
          }
          this.mailService.SendMail(mail).subscribe(result => result ? console.log('send mail successfully!') : console.log('send mail error!'));
        }
      });
  }

  onSubmit() {
    //console.log(this.createAssignFormGroup.value);
  }


  checkAssignStatus(type: string, deadline: Date, actionContent: string): string {
    if (type == 'submit' && actionContent)
      return 'Done';
    if (type == 'draft')
      return 'Draft'
    if (type == 'submit-draft')
      return 'Submit-Draft'
    else {
      if (new Date() <= deadline)
        return 'On-going';
      else
        return 'Pending';
    }
  }


  async reassignSubmit(assignForm: any, type: string) {
    // check permission
    if (!this.checkPermissionAcion(assignForm.ownerId, this.checkRoleByType(type))) { this.alert.showToast('danger', 'Error', "You don't have permission to do it!"); return; }

    let check;
    // Update old assign
    let oldAssign = await this.assignService.getAssign(assignForm.id).toPromise();
    oldAssign.status = 'Reassigned'
    await this.assignService.createAssign(oldAssign).toPromise().then(res => console.log(res));

    // Create new assign
    const deadLine = new Date(format(new Date(assignForm.deadLine), 'yyyy/MM/dd') + ' ' + assignForm.deadLineTime);
    const assignNew: AssignModel = {
      'id': this.guidService.getGuid(),
      'issueNo': this.IssueID,
      'currentStep': this.CurrentStep,
      'team': assignForm.team,
      'ownerId': assignForm.ownerId,
      'name': assignForm.name,
      'email': assignForm.email,
      'requestContent': assignForm.requestContent,
      'actionResult': assignForm.actionResult,
      'actionContent': (type == 'submit' || type == 'submit-draft') ? assignForm.actionContent : '',
      'actionDate': ((type == 'submit' || type == 'submit-draft') && assignForm.actionContent?.length > 0 && assignForm.actionDate == null) ? new Date() : assignForm.actionDate,
      'assignedDate': new Date(),
      'deadLine': deadLine,
      'deadLevel': 0,
      'status': this.checkAssignStatus(type, deadLine, assignForm.actionContent),
      'remark': '',
      'scheduleDeadLine': assignForm.scheduleDeadLine,
      'updatedBy': this.userService.userId(),
      'updatedDate': new Date(),
    }

    this.assignService.createAssign(assignNew).subscribe(
      result => {
        if (result == true)
          this.alert.showToast('success', 'Success', 'Create/Update assign successfully!');
        // Send first email  
        if (type == 'assign') {
          const mail: Mail = {
            sender: 'Pizza Systems',
            to: assignForm.email,
            cc: '',
            bcc: this.userService.email(),
            subject: 'Re-assign-Notification' + this.IssueTitle,
            content:
              "Dear Mr/Ms. " + assignForm.name + ",</br></br>" +
              "You have received a request to fill again in from " + this.userService.userName() + " in Pizza system.</br>" +
              "Deadline: " + format(deadLine, 'yyyy/MM/dd HH:mm') + "</br>" +
              "Current step: " + this.Hearder + "</br>" +
              "Request Content: " + assignForm.requestContent + "</br>" +
              "Please follow below link to view : <a href='" + environment.clientUrl + "/pages/tables/create-issue;issueId=" + this.IssueID + ";type=open;step=" + this.CurrentStep + "'>Pizza - Open Issue</a></br></br>" +
              "Best regards," +
              "</br><a href='" + environment.clientUrl + "'>Pizza System</a></br>"
          }
          this.mailService.SendMail(mail).subscribe(result => result ? console.log('send mail successfully!') : console.log('send mail error!'));
        }
        // Check deadline service - send mail
        this.assignService.checkDeadline(assignNew, this.userService.token()).toPromise().then(result => {
          console.log('Check deadline:' + result);
        });
        // Check deadline service - send mail
        this.assignService.checkDeadline(assignNew, this.userService.token()).toPromise().then(result => {
          console.log('Check deadline:' + result);
        });
        // Reset list assign
        this.showListAssign();
      }
    )

  }

  seftSubmit(assignForm: any, type: string) {
    const assignNew: AssignModel = {
      'id': assignForm.id ? assignForm.id : this.guidService.getGuid(),
      'issueNo': this.IssueID,
      'currentStep': this.CurrentStep,
      'team': assignForm.team,
      'ownerId': assignForm.ownerId,
      'name': assignForm.name,
      'email': assignForm.email,
      'requestContent': 'seft submit',
      'actionResult': assignForm.actionResult,
      'actionContent': (type == 'submit' || type == 'submit-draft') ? assignForm.actionContent : '',
      'actionDate': ((type == 'submit' || type == 'submit-draft') && assignForm.actionContent?.length > 0 && assignForm.actionDate == null) ? new Date() : assignForm.actionDate,
      'assignedDate': assignForm.assignedDate,
      'deadLine': new Date(),
      'deadLevel': 0,
      'status': this.checkAssignStatus(type, new Date(), assignForm.actionContent),
      'remark': '',
      'scheduleDeadLine': null,
      'updatedBy': this.userService.userId(),
      'updatedDate': new Date(),
    }
    this.assignService.createAssign(assignNew).subscribe(res => {
      if (res == true) {
        this.issueService.getIssueById(this.IssueID).subscribe(result => {
          result.issueStatus = 'On-going';
          result.currentStep = (result.currentStep.toLocaleLowerCase() == this.Back) ? this.CurrentStep : result.currentStep;
          this.issueService.createIssue(result).subscribe(resultCreate => {
            if (resultCreate == true) {
              this.alert.showToast('success', 'Success', 'Create/Update assign successfully!');
            }
          })
        })
        // Reset list assign
        this.showListAssign();
      }
    });
  }

  assignSubmit(assignForm: any, type: string) {
    // check permission
    if (!this.checkPermissionAcion(assignForm.ownerId, this.checkRoleByType(type))) { this.alert.showToast('danger', 'Error', "You don't have permission to do it!"); return; }

    // new model - for update in server
    const deadLine = new Date(format(new Date(assignForm.deadLine), 'yyyy/MM/dd') + ' ' + assignForm.deadLineTime);
    const assignNew: AssignModel = {
      'id': assignForm.id ? assignForm.id : this.guidService.getGuid(),
      'issueNo': this.IssueID,
      'currentStep': this.CurrentStep,
      'team': assignForm.team,
      'ownerId': assignForm.ownerId,
      'name': assignForm.name,
      'email': assignForm.email,
      'requestContent': assignForm.requestContent,
      'actionResult': assignForm.actionResult,
      'actionContent': (type == 'submit' || type == 'submit-draft') ? assignForm.actionContent : '',
      'actionDate': ((type == 'submit' || type == 'submit-draft') && assignForm.actionContent?.length > 0 && assignForm.actionDate == null) ? new Date() : assignForm.actionDate,
      'assignedDate': assignForm.assignedDate,
      'deadLine': deadLine,
      'deadLevel': 0,
      'status': this.checkAssignStatus(type, deadLine, assignForm.actionContent),
      'remark': '',
      'scheduleDeadLine': assignForm.scheduleDeadLine,
      'updatedBy': this.userService.userId(),
      'updatedDate': new Date(),
    }
    this.assignService.createAssign(assignNew).subscribe(
      async result => {
        if (result == true)
          this.alert.showToast('success', 'Success', 'Create/Update assign successfully!');
        // Send first email  
        if (type == 'assign') {
          const mail: Mail = {
            sender: 'Pizza Systems',
            to: assignForm.email,
            cc: '',
            bcc: this.userService.email(),
            subject: 'Assign-' + this.IssueTitle,
            content:
              "Dear Mr/Ms. " + assignForm.name + ",</br></br>" +
              "You have received a request to fill in from " + this.userService.userName() + " in Pizza system.</br>" +
              "Deadline: " + format(deadLine, 'yyyy/MM/dd HH:mm') + "</br>" +
              "Current step: " + this.Hearder + "</br>" +
              "Request Content: " + assignForm.requestContent + "</br>" +
              "Please follow below link to view : <a href='" + environment.clientUrl + "/pages/tables/create-issue;issueId=" + this.IssueID + ";type=open;step=" + this.CurrentStep + "'>Pizza - Open Issue</a></br></br>" +
              "Best regards," +
              "</br><a href='" + environment.clientUrl + "'>Pizza System</a></br>"
          }
          this.mailService.SendMail(mail).subscribe(result => result ? console.log('send mail successfully!') : console.log('send mail error!'));
        }
        // Send email when submit
        if (type == 'submit') {
          let initiatorMail = await this.adwebService.getUserDetailByID(this.userService.token(), this.IssueCreator).toPromise();
          const mail: Mail = {
            sender: 'Pizza Systems',
            to: initiatorMail['work_email'],
            cc: '',
            bcc: '',
            subject: 'Notification-' + this.IssueTitle,
            content:
              "Dear Mr/Ms. " + initiatorMail['ad_user_displayName'] + ",</br></br>" +
              "You have received a Submission Notification from " + this.userService.userName() + " in Pizza system.</br>" +
              "Current step : " + this.Hearder + "</br>" +
              "Action Content: " + assignForm.actionContent + "</br>" +
              "Please follow below link to view : <a href='" + environment.clientUrl + "/pages/tables/create-issue;issueId=" + this.IssueID + ";type=open;step=" + this.CurrentStep + "'>Pizza - Open Issue</a></br></br>" +
              "Best regards," +
              "</br><a href='" + environment.clientUrl + "'>Pizza System</a></br>"
          }
          this.mailService.SendMail(mail).subscribe(result => result ? console.log('send mail successfully!') : console.log('send mail error!'));
        }
        // Check deadline service - send mail
        this.assignService.checkDeadline(assignNew, this.userService.token()).toPromise().then(result => {
          console.log('Check deadline:' + result);
        });
        // Reset list assign
        this.showListAssign();
      }
    )

    // Update Issue Step
    if (type == 'submit') {
      this.issueService.getIssueById(this.IssueID).subscribe(result => {
        result.issueStatus = 'On-going',
          result.currentStep = (result.currentStep.toLocaleLowerCase() == this.Back) ? this.CurrentStep : result.currentStep;
        this.issueService.createIssue(result).subscribe(resultCreate => {
          if (resultCreate == true) {
            this.alert.showToast('success', 'Success', 'Create/Update assign successfully!');
          }
        })
      })
    }
  }


  //#endregion



  //#region DeadLine Extend

  openDeadline(dialog: TemplateRef<any>, assignId: string, ownerId: string, deadLine: string, deadLineTime: string) {
    this.dialogService.open(
      dialog,
      {
        context: {
          id: assignId,
          ownerId: ownerId,
          currentDeadLine: new Date(format(new Date(deadLine), 'yyyy/MM/dd') + ' ' + deadLineTime),
        },
      });
    this.showListDeadLine(assignId);
  }

  AddDeadLine(date: string, time: string, reason: string, assignId: string, ownerId: string, currentDeadLine: Date) {
    // check permission
    if (!this.checkPermissionAcion(ownerId, 'Owner')) { this.alert.showToast('danger', 'Error', "You don't have permission to do it!"); return; }

    const newDeadLine: ExtendDLModel = {
      'id': this.guidService.getGuid(),
      'assignNo': assignId,
      'currentDeadLine': currentDeadLine,
      'requestDeadLine': new Date(format(new Date(date), 'yyyy/MM/dd') + ' ' + time),
      'reason': reason,
      'approvalContent': null,
      'status': 'Open',
      'requestDate': new Date(),
      'approvalDate': null
    }
    this.listDeadline.push(newDeadLine);
  }

  SubmitDeadLine(ownerId: string) {
    // check permission
    if (!this.checkPermissionAcion(ownerId, 'Owner')) { this.alert.showToast('danger', 'Error', "You don't have permission to do it!"); return; }

    // Update status OPEN -> On-going
    this.listDeadline.slice(-1)[0].status = 'On-going';
    // Insert DeadLine
    this.assignService.createDeadLine(this.listDeadline.slice(-1)[0]).subscribe(async result => {
      //console.log(result);
      let initiatorMail = await this.adwebService.getUserDetailByID(this.userService.token(), this.IssueCreator).toPromise();
      const mail: Mail = {
        sender: 'Pizza Systems',
        to: initiatorMail['work_email'],
        cc: '',
        bcc: '',
        subject: 'Extend Deadline Request-' + this.IssueTitle,
        content:
          "Dear Mr/Ms. " + initiatorMail['ad_user_displayName'] + ",</br></br>" +
          "You have received a Extend Deadline Request from " + this.userService.userName() + " in Pizza system.</br>" +
          "Current deadline : " + format(this.listDeadline.slice(-1)[0].currentDeadLine, "yyyy/MM/dd HH:mm") + "</br>" +
          "Request deadline : " + format(this.listDeadline.slice(-1)[0].requestDeadLine, "yyyy/MM/dd HH:mm") + "</br>" +
          "Reason: " + this.listDeadline.slice(-1)[0].reason + "</br>" +
          "Please follow below link to view : <a href='" + environment.clientUrl + "/pages/tables/create-issue;issueId=" + this.IssueID + ";type=open;step=" + this.CurrentStep + "'>Pizza - Open Issue</a></br></br>" +
          "Best regards," +
          "</br><a href='" + environment.clientUrl + "'>Pizza System</a></br>"
      }
      this.mailService.SendMail(mail).subscribe(result => result ? console.log('send mail successfully!') : console.log('send mail error!'));
    });
  }

  ApprovalDeadLine(assignId: string, result: number, content: string) {
    // check permission
    if (!this.checkPermissionAcion(null, 'Initiator')) { { this.alert.showToast('danger', 'Error', "You don't have permission to do it!"); return; } return; }

    //console.log(assignId);
    if (result == 1) {
      this.listDeadline.slice(-1)[0].status = 'Approved';
      this.listDeadline.slice(-1)[0].approvalContent = content;
      this.listDeadline.slice(-1)[0].approvalDate = new Date();
      this.assignService.createDeadLine(this.listDeadline.slice(-1)[0]).subscribe(async result => {
        let assignInfor = await this.assignService.getAssign(assignId).toPromise();
        const mail: Mail = {
          sender: 'Pizza Systems',
          to: assignInfor.email,
          cc: '',
          bcc: this.userService.email(),
          subject: 'New Deadline Notification-' + this.IssueTitle,
          content:
            "Dear Mr/Ms. " + assignInfor.name + ",</br></br>" +
            "You have received a New Deadline Notification from " + this.userService.userName() + " in Pizza system.</br>" +
            "Result : Approved</br>" +
            "Remark: " + content + "</br>" +
            "Please follow below link to view : <a href='" + environment.clientUrl + "/pages/tables/create-issue;issueId=" + this.IssueID + ";type=open;step=" + this.CurrentStep + "'>Pizza - Open Issue</a></br></br>" +
            "Best regards," +
            "</br><a href='" + environment.clientUrl + "'>Pizza System</a></br>"
        }
        this.mailService.SendMail(mail).subscribe(result => result ? console.log('send mail successfully!') : console.log('send mail error!'));

      });
      // Update in assign table
      this.assignService.getAssign(assignId).subscribe(result => {
        result.deadLine = this.listDeadline.slice(-1)[0].requestDeadLine;
        this.assignService.createAssign(result).subscribe(res => {
          if (res == true) this.alert.showToast('success', 'Success', 'Approval deadline successfully!');
          // Check deadline service - send mail
          this.assignService.checkDeadline(result, this.userService.token()).toPromise().then(result => {
            console.log('Check deadline:' + result);
          });
          // Update current assign array
          this.showListAssign();
        });
      });
    } else if (content.length > 0) {
      this.listDeadline.slice(-1)[0].status = 'Rejected'
      this.listDeadline.slice(-1)[0].approvalContent = content;
      this.listDeadline.slice(-1)[0].approvalDate = new Date();
      this.assignService.createDeadLine(this.listDeadline.slice(-1)[0]).subscribe(async result => {
        if (result == true) {
          let assignInfor = await this.assignService.getAssign(assignId).toPromise();
          const mail: Mail = {
            sender: 'Pizza Systems',
            to: assignInfor.email,
            cc: '',
            bcc: this.userService.email(),
            subject: 'New Deadline Notification-' + this.IssueTitle,
            content:
              "Dear Mr/Ms. " + assignInfor.name + ",</br></br>" +
              "You have received a New Deadline Notification from " + this.userService.userName() + " in Pizza system.</br>" +
              "Result : Rejected</br>" +
              "Reason: " + content + "</br>" +
              "Please follow below link to view : <a href='" + environment.clientUrl + "/pages/tables/create-issue;issueId=" + this.IssueID + ";type=open;step=" + this.CurrentStep + "'>Pizza - Open Issue</a></br></br>" +
              "Best regards," +
              "</br><a href='" + environment.clientUrl + "'>Pizza System</a></br>"
          }
          this.mailService.SendMail(mail).subscribe(result => result ? console.log('send mail successfully!') : console.log('send mail error!'));
          this.alert.showToast('success', 'Success', 'Reject deadline successfully!');
        }
      });
    } else {
      this.alert.showToast('danger', 'Error', 'Comment required with reject selection!');
    }
  }

  //#endregion


  NextStep() {
    this.nextStatus.emit(this.Next);
  }
  BackStep() {
    this.backStatus.emit(this.Back);
  }

}
