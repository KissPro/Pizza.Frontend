import { Input } from '@angular/core';
import { ChangeDetectorRef, EventEmitter, Output, TemplateRef } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
    this.showCaPa();
  }

  showListDeadLine(assignId: string) {
    this.listDeadline = [];
    this.assignService.getListDeadLine(assignId).subscribe(result => {
      result.forEach((item) => this.listDeadline.push(item));
    });
  }
  showCaPa() {
    this.assignService.getListAssign(this.IssueID).subscribe(result => {
      result.forEach((item) => {
        if (item.currentStep === 'capa')
          this.capaFormGroup.patchValue({
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
      // setTimeout(() => this.inputRecommended = 'hoanghoagn', 4000);
      // Update issue information 
      this.capaFormGroup.patchValue({
        capaDetail: result.capadetail == null ? '<p></p>' : result.capadetail,
      });
      console.log(result.capadetail);
      this.ref.markForCheck();
    })
  }
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
      console.log(result);
    });
  }

  ApprovalDeadLine(assignId: string, result: number, content: string) {
    console.log(assignId);
    if (result == 1) {
      this.listDeadline.slice(-1)[0].status = 'Approved';
      this.listDeadline.slice(-1)[0].approvalContent = content;
      this.listDeadline.slice(-1)[0].approvalDate = new Date();
      this.assignService.createDeadLine(this.listDeadline.slice(-1)[0]).subscribe(result => {
        console.log(result);
      });
      // Update in assign table
      this.assignService.getAssign(assignId).subscribe(result => {
        result.deadLine = this.listDeadline.slice(-1)[0].requestDeadLine;
        this.assignService.createAssign(result).subscribe(res => {
          if (res == true) this.alert.showToast('success', 'Success', 'Approval deadline successfully!');
          // Update current assign array
          this.showCaPa();
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

  capaFormGroup: FormGroup = this.formBuilder.group({
    id: '',
    ownerId: '',
    name: '',
    email: '',
    team: '',
    requestContent: ['', [Validators.required]],
    deadLine: ['', [Validators.required]],
    deadLineTime: ['', [Validators.required]],
    assignedDate: new Date(),
    capaDetail: '',
  })
  updateRickText(value: string) {
    this.capaFormGroup.patchValue({ capaDetail: value })
  }

  addNewAssign(idMail: string) {
    // Get information
    var token = JSON.parse(localStorage.getItem('user')).token["access_token"];
    this.adwebService.getUserDetailByEmail(token, idMail).subscribe(result => {
      if (result != null) {
        this.capaFormGroup.patchValue({
          ownerId: result['ad_user_employeeID'],
          name: result['ad_user_displayName'],
          email: result['work_email'],
          team: result['department_id'][1],
        })
      }
      else {
        this.adwebService.getUserDetailByID(token, idMail).subscribe(result => {
          if (result != null) {
            this.capaFormGroup.patchValue({
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
  checkAssignStatus(deadline: Date, actionContent: string): string {
    if (actionContent != undefined && actionContent?.length > 0)
      return 'Done';
    else if (new Date() <= deadline)
      return 'On-going';
    else
      return 'Pending';
  }
  AssignSubmit2() {
    // Insert assign value
    // new model - for update in server
    const deadLine = new Date(format(new Date(this.capaFormGroup.value.deadLine), 'yyyy/MM/dd') + ' ' + this.capaFormGroup.value.deadLineTime);
    const assignNew: AssignModel = {
      'id': this.guidService.getGuid(),
      'issueNo': this.IssueID,
      'currentStep': 'capa',
      'team': this.capaFormGroup.value.team,
      'ownerId': this.capaFormGroup.value.ownerId,
      'name': this.capaFormGroup.value.name,
      'email': this.capaFormGroup.value.email,
      'requestContent': this.capaFormGroup.value.requestContent,
      'actionResult': null,
      'actionContent': null,
      'actionDate': (this.capaFormGroup.value.capaDetail?.length > 0 && this.capaFormGroup.value.actionDate == null) ? new Date() : this.capaFormGroup.value.actionDate,
      'assignedDate': this.capaFormGroup.value.assignedDate,
      'deadLine': deadLine,
      'deadLevel': 0,
      'status': this.checkAssignStatus(deadLine, this.capaFormGroup.value.capaDetail),
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
  }

  CAPASubmit() {
    this.issueService.getIssueById(this.IssueID).subscribe(result => {
      // Update issue information 
      result.capadetail = this.capaFormGroup.value.capaDetail;
      this.issueService.createIssue(result).subscribe(resultCreate => {
        if (resultCreate == true) {
          // Update assign status (status of step)
          this.AssignSubmit2();
        }
      })
    })
  }

  NextStep() {
    this.nextStatus.emit('close');
  }
  BackStep() {
    this.backStatus.emit('caca');
  }

}
