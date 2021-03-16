import { Input } from '@angular/core';
import { ChangeDetectorRef, EventEmitter, Output, TemplateRef } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbToastrService, NbDialogService } from '@nebular/theme';
import { AssignModel, ExtendDLModel } from 'app/@core/models/assign';
import { AdwebService } from 'app/@core/service/adweb.service';
import { AssginService } from 'app/@core/service/assign.service';
import { AuthenticationService } from 'app/@core/service/authentication.service';
import { GuidService } from 'app/@core/service/guid.service';
import { IssueService } from 'app/@core/service/issue.service';
import { ToastrComponent } from 'app/pages/modal-overlays/toastr/toastr.component';
import { format } from 'date-fns';

@Component({
  selector: 'ngx-capa',
  templateUrl: './capa.component.html',
  styleUrls: ['./capa.component.scss']
})
export class CapaComponent implements OnInit {

  // Init
  alert = new ToastrComponent(this.toastrService);


  @Input() IssueID: any;
  @Output() nextStatus = new EventEmitter<any>();
  @Output() backStatus = new EventEmitter<any>();

  listDeadline: ExtendDLModel[] = [];
  inputOwner = '';
  // IssueID = '2D864EC3-3DBC-4C06-BC12-31E50D880B16';

  constructor(
    private formBuilder: FormBuilder,
    private adwebService: AdwebService,
    private toastrService: NbToastrService,
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

  showListAssign() {
    this.listAssign().clear();
    this.assignService.getListAssign(this.IssueID).subscribe(result => {
      result.forEach((item) => {
        if (item.currentStep === 'capa')
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

  removeAssign(index: number, assignId: string) {
    // remove in list
    this.listAssign().removeAt(index);
    // remove in server
    if (assignId != null)
      this.assignService.removeAssign(assignId).subscribe(result => {
        if (result == true) this.alert.showToast('success', 'Success', 'Remove assign successfully!');
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
      return 'Draft-Submit'
    else {
      if (new Date() <= deadline)
        return 'On-going';
      else
        return 'Pending';
    }
  }


  async reassignSubmit(assignForm: any, type: string) {
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
      'currentStep': 'capa',
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

    console.log(assignNew);

    this.assignService.createAssign(assignNew).subscribe(
      result => {
        if (result == true)
          this.alert.showToast('success', 'Success', 'Create/Update assign successfully!');
        // Check deadline service - send mail
        this.assignService.checkDeadline(assignNew, this.userService.token()).toPromise().then(result => {
          console.log('Check deadline:' + result);
        });
        // Reset list assign
        this.showListAssign();
      }
    )

  }


  assignSubmit(assignForm: any, type: string) {
    // new model - for update in server
    const deadLine = new Date(format(new Date(assignForm.deadLine), 'yyyy/MM/dd') + ' ' + assignForm.deadLineTime);
    const assignNew: AssignModel = {
      'id': assignForm.id ? assignForm.id : this.guidService.getGuid(),
      'issueNo': this.IssueID,
      'currentStep': 'capa',
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
    console.log(assignNew);
    this.assignService.createAssign(assignNew).subscribe(
      result => {
        if (result == true)
          this.alert.showToast('success', 'Success', 'Create/Update assign successfully!');

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
        result.currentStep = (result.currentStep == 'Caca') ? 'Capa' : result.currentStep;
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

  openDeadline(dialog: TemplateRef<any>, assignId: string, deadLine: string, deadLineTime: string) {
    this.dialogService.open(
      dialog,
      {
        context: {
          id: assignId,
          currentDeadLine: new Date(format(new Date(deadLine), 'yyyy/MM/dd') + ' ' + deadLineTime),
        },
      });
    this.showListDeadLine(assignId);
  }

  AddDeadLine(date: string, time: string, reason: string, assignId: string, currentDeadLine: Date) {
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

  SubmitDeadLine(assignId: string) {
    // Update status OPEN -> On-going
    this.listDeadline.slice(-1)[0].status = 'On-going';
    // Insert DeadLine
    this.assignService.createDeadLine(this.listDeadline.slice(-1)[0]).subscribe(result => {
      //console.log(result);
    });
  }

  ApprovalDeadLine(assignId: string, result: number, content: string) {
    //console.log(assignId);
    if (result == 1) {
      this.listDeadline.slice(-1)[0].status = 'Approved';
      this.listDeadline.slice(-1)[0].approvalContent = content;
      this.listDeadline.slice(-1)[0].approvalDate = new Date();
      this.assignService.createDeadLine(this.listDeadline.slice(-1)[0]).subscribe(result => {
        //console.log(result);
      });
      // Update in assign table
      this.assignService.getAssign(assignId).subscribe(result => {
        result.deadLine = this.listDeadline.slice(-1)[0].requestDeadLine;
        this.assignService.createAssign(result).subscribe(res => {
          if (res == true) this.alert.showToast('success', 'Success', 'Approval deadline successfully!');
          // Update current assign array
          this.showListAssign();
        });
      });
    } else if (content.length > 0) {
      this.listDeadline.slice(-1)[0].status = 'Rejected'
      this.listDeadline.slice(-1)[0].approvalContent = content;
      this.listDeadline.slice(-1)[0].approvalDate = new Date();
      this.assignService.createDeadLine(this.listDeadline.slice(-1)[0]).subscribe(result => {
        if (result == true) this.alert.showToast('success', 'Success', 'Reject deadline successfully!');
      });
    } else {
      this.alert.showToast('danger', 'Error', 'Comment required with reject selection!');
    }
  }
  //#endregion


  NextStep() {
    this.nextStatus.emit('close');
  }
  BackStep() {
    this.backStatus.emit('caca');
  }

}
