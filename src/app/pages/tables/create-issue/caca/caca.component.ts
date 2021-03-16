import { Input } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { ChangeDetectorRef, Component, ElementRef, OnInit, Output, QueryList, TemplateRef, ViewChild, ViewChildren } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbDialogService, NbToastrService } from '@nebular/theme';
import { AssignModel, ExtendDLModel } from 'app/@core/models/assign';
import { AdwebService } from 'app/@core/service/adweb.service';
import { AssginService } from 'app/@core/service/assign.service';
import { AuthenticationService } from 'app/@core/service/authentication.service';
import { GuidService } from 'app/@core/service/guid.service';
import { IssueService } from 'app/@core/service/issue.service';
import { ToastrComponent } from 'app/pages/modal-overlays/toastr/toastr.component';
import { format } from 'date-fns';

@Component({
  selector: 'ngx-caca',
  templateUrl: './caca.component.html',
  styleUrls: ['./caca.component.scss']
})
export class CacaComponent implements OnInit {

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

  // Init 
  alert = new ToastrComponent(this.toastrService);
  inputOwner = '';
  // IssueID = '2D864EC3-3DBC-4C06-BC12-31E50D880B16';
  inputOwner2 = '';
  listDeadline: ExtendDLModel[] = [];

  @Input() IssueID: any;
  @Output() nextStatus = new EventEmitter<any>();
  @Output() backStatus = new EventEmitter<any>();



  ngOnInit(): void {
    this.showListAssign();
    this.showCauseAnalysis();
  }

  showListAssign() {
    this.listAssign().clear();
    this.assignService.getListAssign(this.IssueID).subscribe(result => {
      result.forEach((item) => {
        if (item.currentStep === 'containment action')
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

  showCauseAnalysis() {
    this.assignService.getListAssign(this.IssueID).subscribe(result => {
      result.forEach((item) => {
        if (item.currentStep === 'cause analysis')
          this.analysisFormGroup.patchValue({
            id: item.id,
            ownerId: item.ownerId,
            name: item.name,
            email: item.email,
            team: item.team,
            requestContent: item.requestContent,
            deadLine: new Date(item.deadLine),
            deadLineTime: format(new Date(item.deadLine), 'HH:mm'),
          })
      });
    });
    this.issueService.getIssueById(this.IssueID).subscribe(result => {
      // setTimeout(() =, 4000);
      //console.log(result);
      // Update issue information 
      this.analysisFormGroup.patchValue({
        analysisDetail: result.analysisDetail ? result.analysisDetail : '<p></p>',
        sampleReceivingDate: result.sampleReceivingTime ? new Date(result.sampleReceivingTime) : null,
        sampleReceivingTime: result.sampleReceivingTime ? format(new Date(result.sampleReceivingTime), 'HH:mm') : null,
        recommendedAction: result.recommendedAction ? result.recommendedAction : '<p></p>',
        escapeCause: result.escapeCause
      });
      //console.log(result.analysisDetail == null);
      // this.ref.markForCheck();
    })
  }


  // Assign Approval
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
      status: 'Open',
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
    if (type == 'submit' && actionContent != undefined && actionContent?.length > 0)
      return 'Done';
    else if (new Date() <= deadline)
      return 'On-going';
    else
      return 'Pending';
  }

  AssignSubmit(type: string) {
    // Insert that value
    //console.log(type)
    const listAssign = this.listAssign().value;
    listAssign.forEach((assignForm, index) => {
      // new model - for update in server
      const deadLine = new Date(format(new Date(assignForm.deadLine), 'yyyy/MM/dd') + ' ' + assignForm.deadLineTime);
      const assignNew: AssignModel = {
        'id': this.guidService.getGuid(),
        'issueNo': this.IssueID,
        'currentStep': 'containment action',
        'team': assignForm.team,
        'ownerId': assignForm.ownerId,
        'name': assignForm.name,
        'email': assignForm.email,
        'requestContent': assignForm.requestContent,
        'actionResult': assignForm.actionResult,
        'actionContent': type == 'submit' ? assignForm.actionContent : '',
        'actionDate': (type == 'submit' && assignForm.actionContent?.length > 0 && assignForm.actionDate == null) ? new Date() : assignForm.actionDate,
        'assignedDate': assignForm.assignedDate,
        'deadLine': deadLine,
        'deadLevel': 0,
        'status': this.checkAssignStatus(type, deadLine, assignForm.actionContent),
        'remark': '',
        'updatedBy': this.userService.userId(),
        'updatedDate': new Date(),
      }
      this.assignService.createAssign(assignNew).subscribe(
        result => {
          if (result == true)
            this.alert.showToast('success', 'Success', 'Create/Update assign successfully!');
          // Reset list assign
          if (index == listAssign.length - 1)
            this.showListAssign();
        }
      )
    });
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
          this.showCauseAnalysis();
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

  //#region Cause Analysis


  analysisFormGroup: FormGroup = this.formBuilder.group({
    id: '',
    ownerId: '',
    name: '',
    email: '',
    team: '',
    requestContent: ['', [Validators.required]],
    deadLine: ['', [Validators.required]],
    deadLineTime: ['', [Validators.required]],
    assignedDate: new Date(),
    sampleReceivingDate: '',
    sampleReceivingTime: '',
    analysisDetail: '',
    recommendedAction: '',
    escapeCause: '',
  })
  updateRickText2(index: number, value: string) {
    if (index === 1)
      this.analysisFormGroup.patchValue({ analysisDetail: value })
    else
      this.analysisFormGroup.patchValue({ recommendedAction: value })
  }

  addNewAssign2(idMail: string) {
    // Get information
    var token = JSON.parse(localStorage.getItem('user')).token["access_token"];
    this.adwebService.getUserDetailByEmail(token, idMail).subscribe(result => {
      if (result != null) {
        this.analysisFormGroup.patchValue({
          ownerId: result['ad_user_employeeID'],
          name: result['ad_user_displayName'],
          email: result['work_email'],
          team: result['department_id'][1],
        })
      }
      else {
        this.adwebService.getUserDetailByID(token, idMail).subscribe(result => {
          if (result != null) {
            this.analysisFormGroup.patchValue({
              ownerId: result['ad_user_employeeID'],
              name: result['ad_user_displayName'],
              email: result['work_email'],
              team: result['department_id'][1],
            })
          }
          else {
            this.alert.showToast('danger', 'Error', 'This id or email not exists in the system!');
          }
        });
      }
    });
  }

  AssignAnalysis(type: string) {
    // Insert assign value
    // new model - for update in server
    const deadLine = new Date(format(new Date(this.analysisFormGroup.value.deadLine), 'yyyy/MM/dd') + ' ' + this.analysisFormGroup.value.deadLineTime);
    const assignNew: AssignModel = {
      'id': this.guidService.getGuid(),
      'issueNo': this.IssueID,
      'currentStep': 'cause analysis',
      'team': this.analysisFormGroup.value.team,
      'ownerId': this.analysisFormGroup.value.ownerId,
      'name': this.analysisFormGroup.value.name,
      'email': this.analysisFormGroup.value.email,
      'requestContent': this.analysisFormGroup.value.requestContent,
      'actionResult': null,
      'actionContent': null,
      'actionDate': (this.analysisFormGroup.value.analysisDetail?.length > 0 && this.analysisFormGroup.value.actionDate == null) ? new Date() : this.analysisFormGroup.value.actionDate,
      'assignedDate': this.analysisFormGroup.value.assignedDate,
      'deadLine': deadLine,
      'deadLevel': 0,
      'status': this.checkAssignStatus(type, deadLine, this.analysisFormGroup.value.analysisDetail),
      'remark': '',
      'updatedBy': this.userService.userId(),
      'updatedDate': new Date(),
    }
    this.assignService.createAssign(assignNew).subscribe(
      result => {
        if (result == true)
          this.alert.showToast('success', 'Success', 'Create/Update assign successfully!');
      }
    )
    if (type == 'submit') {
      const receiveDate = new Date(format(new Date(this.analysisFormGroup.value.sampleReceivingDate), 'yyyy/MM/dd') + ' ' + this.analysisFormGroup.value.sampleReceivingTime);
      //console.log(receiveDate);
      this.issueService.getIssueById(this.IssueID).subscribe(result => {
        // Update issue information 
        result.issueStatus = 'On-going',
          result.currentStep = (result.currentStep == 'Open') ? 'Caca' : result.currentStep;
        result.analysisDetail = this.analysisFormGroup.value.analysisDetail;
        result.sampleReceivingTime = receiveDate;
        result.recommendedAction = this.analysisFormGroup.value.recommendedAction;
        result.escapeCause = this.analysisFormGroup.value.escapeCause;
        this.issueService.createIssue(result).subscribe(resultCreate => {
          if (resultCreate == true) {
            // Update assign status (status of step)
            // this.AssignSubmit2();
            this.alert.showToast('success', 'Success', 'Create/Update assign successfully!');

          }
        })
      })
    }
  }

  // AnalysisSubmit() {
  //   const receiveDate = new Date(format(new Date(this.analysisFormGroup.value.sampleReceivingDate), 'yyyy/MM/dd') + ' ' + this.analysisFormGroup.value.sampleReceivingTime);
  //   //console.log(receiveDate);
  //   this.issueService.getIssueById(this.IssueID).subscribe(result => {
  //     // Update issue information 
  //     result.issueStatus = 'On-going',
  //       result.currentStep = (result.currentStep == 'Open') ? 'Caca' : result.currentStep;
  //     result.analysisDetail = this.analysisFormGroup.value.analysisDetail;
  //     result.sampleReceivingTime = receiveDate;
  //     result.recommendedAction = this.analysisFormGroup.value.recommendedAction;
  //     result.escapeCause = this.analysisFormGroup.value.escapeCause;
  //     this.issueService.createIssue(result).subscribe(resultCreate => {
  //       if (resultCreate == true) {
  //         // Update assign status (status of step)
  //         this.AssignSubmit2();
  //       }
  //     })
  //   })
  // }

  NextStep() {
    this.nextStatus.emit('capa');
  }
  BackStep() {
    this.backStatus.emit('openIssue');
  }
  //#endregion
}


















