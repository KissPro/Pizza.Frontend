import { ViewportScroller } from '@angular/common';
import { nullSafeIsEquivalent } from '@angular/compiler/src/output/output_ast';
import { resolveSanitizationFn } from '@angular/compiler/src/render3/view/template';
import { AfterViewInit, Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbDialogService, NbToastrService } from '@nebular/theme';
import { FileModel } from 'app/@core/models/file-attach';
import { IssueModel } from 'app/@core/models/issue';
import { DropListModel } from 'app/@core/models/issue-config';
import { MailModel, OBAModel, ProcessModel, ProductModel, UploadFileModel } from 'app/@core/models/issue-type';
import { AdwebService } from 'app/@core/service/adweb.service';
import { AuthenticationService } from 'app/@core/service/authentication.service';
import { GuidService } from 'app/@core/service/guid.service';
import { ConfigIssueService } from 'app/@core/service/issue-config.service';
import { IssueService } from 'app/@core/service/issue.service';
import { UploadService } from 'app/@core/service/upload-file.service';
import { DialogUploadFileComponent } from 'app/pages/modal-overlays/dialog/dialog-upload-file/dialog-upload-file.component';
import { ToastrComponent } from 'app/pages/modal-overlays/toastr/toastr.component';
import { format, isThisSecond } from 'date-fns';
import { parseHTML } from 'jquery';
import { forkJoin, Observable, of } from 'rxjs';



@Component({
  selector: 'ngx-create-issue',
  templateUrl: './create-issue.component.html',
  styleUrls: ['./create-issue.component.scss']
})
export class CreateIssueComponent implements OnInit, AfterViewInit {

  constructor(
    private formBuilder: FormBuilder,
    private dialogService: NbDialogService,
    private fileService: UploadService,
    private issueService: IssueService,
    private toastrService: NbToastrService,
    private configIssueService: ConfigIssueService,
    private guidService: GuidService,
    private userService: AuthenticationService,
    private adwebService: AdwebService,
    private viewPortScroller: ViewportScroller//inject

  ) { }
  @ViewChild('step') step;




  ngAfterViewInit(): void {
    var el: HTMLElement = document.getElementById('initNext');
    // el.click();
    // el.click();

  }

  // Control Stepper
  next(nextStatus: string) {
    this.currentStatus = nextStatus;
    console.log(nextStatus);
    this.step.next();

    // goto top
    let top = document.getElementById('GoToTop');
    if (top !== null) {
      top.scrollIntoView();
      top = null;
    }
  }

  testClick(step: string) {
    this.currentStatus = step;
  }

  loading = false;
  currentProcess: ProcessModel = null;
  // currentStatus: string = 'openIssue';
  currentStatus: string = 'caca';

  listAttack: FileModel[] = [];
  listNotify: MailModel[] = [];

  inputRick = '<p>Hello world!</p>'
  listProcess: ProcessModel[];
  listDefectPart: DropListModel[];
  listDefectName: DropListModel[];
  listDefectType: DropListModel[];
  listPattern: DropListModel[];

  issueNo: string = '';
  issueTitle: string = '';

  // Clear input notity mail
  emailNoti: string;
  nameNoti: string;
  idNoti: string;

  alert = new ToastrComponent(this.toastrService);



  ngOnInit(): void {

    this.issueService.getListProcess().subscribe(
      result => {
        this.listProcess = result;
      }
    );

    // Get list dropdownlist config
    this.configIssueService.getDropdown('Defect Part').subscribe(
      result => { this.listDefectPart = result; }
    );
    this.configIssueService.getDropdown('Defect Name').subscribe(
      result => this.listDefectName = result
    );
    this.configIssueService.getDropdown('Defect Type').subscribe(
      result => this.listDefectType = result
    );
    this.configIssueService.getDropdown('Pattern').subscribe(
      result => this.listPattern = result
    );
  }

  updateRickText(value: string) {
    this.issueFormGroup.patchValue({ failureDesc: value })
  }

  changeProcess(event: any) {
    this.currentProcess = event;

    console.log(this.currentProcess.refTable);
    this.issueFormGroup.reset();
    this.obaFormGroup.reset();
    this.productFormGroup.reset();
  }

  //#region Mail notification
  checkMailInformation() {
    let team: string = '';
    let newMail: MailModel;
    var token = JSON.parse(localStorage.getItem('user')).token["access_token"];

    // Check infor 
    // If: exist -> update information, else add
    // const allTask = forkJoin({
    //   task1: this.adwebService.getUserDetailByEmail(token, email).subscribe(result => {
    //     if (result['ad_user_employeeID'].length !== null) {
    //       name = result['ad_user_displayName'],
    //         id = result['ad_user_employeeID'],
    //         team = result['department_id'][1];
    //     }
    //   }),
    //   task2: this.adwebService.getUserDetailByName(token, name).subscribe(result => {
    //     if (result['ad_user_employeeID'].length !== null) {
    //       email = result['work_email'],
    //         id = result['ad_user_employeeID'],
    //         team = result['department_id'][1];
    //     }
    //   }),
    // })
    // allTask.subscribe(() => {
    //   const newMail: MailModel = {
    //     name: name,
    //     empId: id,
    //     email: email,
    //     team: team,
    //   };
    //   this.listNotify.push(newMail);
    // });

    var token = JSON.parse(localStorage.getItem('user')).token["access_token"];
    if (this.emailNoti != null && this.emailNoti != '') {
      this.adwebService.getUserDetailByEmail(token, this.emailNoti).subscribe(result => {
        if (result != null) {
          newMail = {
            name: result['ad_user_displayName'],
            empId: result['ad_user_employeeID'],
            email: this.emailNoti,
            team: result['department_id'][1],
          };
          this.updateAndClearNotiInput(newMail);
        }
      });
    }
    else if (this.nameNoti != null && this.nameNoti != '') {
      this.adwebService.getUserDetailByName(token, this.nameNoti).subscribe(result => {
        console.log(result);
        if (result != null) {
          newMail = {
            name: this.nameNoti,
            empId: result['ad_user_employeeID'],
            email: result['work_email'],
            team: result['department_id'][1]
          };
          this.updateAndClearNotiInput(newMail);
        }
      });
    }
    else if (this.idNoti != null && this.idNoti != '') {
      this.adwebService.getUserDetailByID(token, this.idNoti).subscribe(result => {
        if (result != null) {
          newMail = {
            name: result['ad_user_displayName'],
            empId: this.idNoti,
            email: result['work_email'],
            team: result['department_id'][1]
          };
          this.updateAndClearNotiInput(newMail);
        }
      });
    }
    newMail = {
      name: this.nameNoti,
      empId: this.idNoti,
      email: this.emailNoti,
      team: 'FUSHAN'
    };
    this.listNotify.push(newMail);
  }
  updateAndClearNotiInput(mail: MailModel) {
    // update
    console.log(mail);
    let itemIndex = this.listNotify.findIndex(x => x.email == mail.email || x.name == mail.name || x.empId == mail.empId);
    this.listNotify[itemIndex] = mail;
    console.log(itemIndex);
    // clear textbox
    this.emailNoti = null;
    this.nameNoti = null;
    this.idNoti = null;
  }
  removeNoti(mail: string) {
    console.log(mail);
    this.listNotify = this.listNotify.filter(x => x.email !== mail);
  }
  //#endregion



  getInforByIMEI(imei: string) {
    this.loading = true;
    this.issueService.getIMEIInformation(imei).subscribe(
      result => {
        if (result.length > 0) {
          console.log(new Date(result[0].shift).getHours());
          this.productFormGroup.patchValue({
            imei: result[0].imei,
            customer: result[0].customer,
            product: result[0].product,
            psn: result[0].psn,
            ponno: result[0].ponno,
            ponsize: result[0].ponsize,
            spcode: result[0].spcode,
            line: result[0].line,
            shift: (new Date(result[0].shift).getHours() >= 8 && new Date(result[0].shift).getHours() < 20) ? 'Day' : 'Night',
          })
        } else {
          this.alert.showToast('danger', 'Error', 'IMEI not contain in the system!');
          this.productFormGroup.reset();
        }
        this.loading = false;
      }
    );
  }

  initIssueTitle() {
    let issueNo = '';
    issueNo += (this.productFormGroup.value?.customer !== null) ? (this.productFormGroup.value.customer + '-') : '';
    issueNo += this.currentProcess != null ? this.currentProcess.processName : '';
    issueNo += this.productFormGroup.value?.product !== null ? ('-' + this.productFormGroup.value.product) : '';
    issueNo += ((this.obaFormGroup.value?.defectPart !== '' && this.obaFormGroup.value?.defectPart !== null) ? ('-' + this.obaFormGroup.value.defectPart) : '');
    issueNo += ((this.obaFormGroup.value?.defectName !== '' && this.obaFormGroup.value?.defectName !== null) ? ('-' + this.obaFormGroup.value.defectName) : '');
    issueNo += ((this.obaFormGroup.value?.defectType !== '' && this.obaFormGroup.value?.defectType !== null) ? ('-' + this.obaFormGroup.value.defectType) : '');
    issueNo += '-' + format(new Date(), "yyyyMMddHHmm").toString();
    // issueNo += '-1234';
    return issueNo;
  }
  initIssueNo() {
    let issueTitle = '';
    issueTitle += this.productFormGroup.value?.customer !== null ? (this.productFormGroup.value.customer + '-') : '';
    issueTitle += ((this.currentProcess != null) ? this.currentProcess.processName : '');
    issueTitle += '-' + format(new Date(), "yyyyMMddHHmm").toString();
    // issueTitle += '-1234';
    return issueTitle;
  }

  submitForm() {
    console.log(this.issueFormGroup.value);
    console.log(this.obaFormGroup.value);
    console.log(this.productFormGroup.value);
    console.log(this.issueFormGroup.status);
    console.log(this.obaFormGroup.status);
    console.log(this.productFormGroup.status);
  }

  saveIssue() {
    const guidID = this.guidService.getGuid();
    let finalResult: any;

    if (this.listNotify.length === 0) {
      this.alert.showToast('warning', 'Warning', 'You need input notification list!');
      return;
    }
    const issueNew : IssueModel = {
      id: guidID,
      processType: this.currentProcess.processName,
      issueNo: this.initIssueNo(),
      title: this.initIssueTitle(),
      rpn: this.issueFormGroup.value?.rpn,
      severity: this.issueFormGroup.value?.rpn < 100 ? 'Major' : 'Critical',
      repeateddSymptom: this.issueFormGroup.value?.repeateddSymptom,
      failureDesc: this.issueFormGroup.value?.failureDesc,
      fileAttack: this.issueFormGroup.value?.fileAttack,
      notifiedList: this.listNotify.map(x => x.email).join(";"),
      issueStatus: 'Open', // update later
      currentStep: 'Containment Action',
      stepStatus: 'On-going',
      containmentAction: this.issueFormGroup.value?.containmentAction,
      analysisDetail: this.issueFormGroup.value?.analysisDetail,
      sampleReceivingTime: null,
      recommendedAction: this.issueFormGroup.value?.recommendedAction,
      escapeCause: this.issueFormGroup.value?.escapeCause,
      capadetail: this.issueFormGroup.value?.capadetail,
      verifyNote: this.issueFormGroup.value?.verifyNote,
    }
    this.issueService.createIssue(issueNew)
      .subscribe(result => {
        if (result == true) {
          // Check process type.
          // Type : OBA -> Insert tblOBA, tblProduct
          if (this.currentProcess.processName === 'OBA') {
            const obaNew: OBAModel = {
              'id': this.guidService.getGuid(),
              'issueId': guidID,
              'detectingTime': new Date(format(new Date(this.obaFormGroup.value?.detectingDate), 'yyyy/MM/dd') + ' ' + this.obaFormGroup.value?.detectingTime),
              'defectPart': this.obaFormGroup.value?.defectPart,
              'defectName': this.obaFormGroup.value?.defectName,
              'defectType': this.obaFormGroup.value?.defectType,
              'samplingQty': this.obaFormGroup.value?.samplingQty,
              'ngphoneOrdinal': this.obaFormGroup.value?.ngphoneOrdinal,
            };
            this.issueService.createOBA(obaNew).subscribe(
              result => finalResult = result
            );
            const productNew: ProductModel = {
              'id': this.guidService.getGuid(),
              'issueId': guidID,
              'imei': this.productFormGroup.value?.imei,
              'customer': this.productFormGroup.value?.customer,
              'product': this.productFormGroup.value?.product,
              'psn': this.productFormGroup.value?.psn,
              'ponno': this.productFormGroup.value?.ponno,
              'ponsize': this.productFormGroup.value?.ponsize,
              'spcode': this.productFormGroup.value?.spcode,
              'line': this.productFormGroup.value?.line,
              'pattern': this.productFormGroup.value?.pattern,
              'shift': this.productFormGroup.value?.shift,
            }
            this.issueService.createProduct(productNew).subscribe(
              result => finalResult = result
            );
          }
          // Insert List File
          this.listAttack.forEach(element => {
            if (finalResult == false) return;
            const fileNew: UploadFileModel = {
              'id': this.guidService.getGuid(),
              'issueId': guidID,
              'currentStep': 'OPEN',
              'type': element.type,
              'name': element.name,
              'url': element.link,
              'remark': '',
              'uploadedBy': this.userService.userId(),
              'uploadedDate': new Date(),
            }
            this.issueService.createFile(fileNew).subscribe(
              result => finalResult = result
            );
          });
        }
        if (finalResult == true)
          this.alert.showToast('danger', 'Error', 'IMEI not contain in the system!');
        else
          this.alert.showToast('success', 'Success', 'Save issue successfully!');
      });
  }


  //#region Form Init
  // Issue information general
  issueFormGroup: FormGroup = this.formBuilder.group({
    processType: null,
    issueNo: '',
    title: '',
    rpn: [null, [Validators.required]],
    severity: '',
    repeateddSymptom: '',
    failureDesc: '',
    fileAttack: null,
    notifiedList: '',
    issueStatus: '',
    currentStep: '',
    stepStatus: '',
    containmentAction: '',
    analysisDetail: '',
    recommendedAction: '',
    escapeCause: '',
    capadetail: '',
    verifyNote: '',
  });

  // OBA table
  obaFormGroup: FormGroup = this.formBuilder.group({
    issueId: '',
    detectingDate: '',
    detectingTime: '',
    defectPart: ['', [Validators.required]],
    defectName: ['', [Validators.required]],
    defectType: ['', [Validators.required]],
    samplingQty: '',
    ngphoneOrdinal: '',
  });

  // Product table
  productFormGroup: FormGroup = this.formBuilder.group({
    issueId: '',
    imei: ['', [Validators.required]],
    customer: '',
    product: '',
    psn: '',
    ponno: '',
    ponsize: '',
    spcode: '',


    line: '',
    pattern: '',
    shift: '',
  });

  

  //#endregion

  //#region Images and File Upload
  uploadFile(): void {
    this.dialogService.open(DialogUploadFileComponent, {
      context: {
        type: 'Issue',
      },
    }).onClose.subscribe(result => (result !== null) ? this.addAttachList(result) : null);
  }
  addAttachList(file: FileModel) {
    this.listAttack.push(file);
  }

  downloadFile(file: FileModel) {
    this.fileService.DownloadFile(file.link, file.type)
      .subscribe(
        result => this.fileService.ShowFile(result, file.name),
      );
  }

  deleteFile(path: string) {
    this.fileService.DeleteFile(path).subscribe();
    console.log(path);
    console.log(this.listAttack);
    // this.listAttack.slice(this.listAttack.indexOf(this.listAttack.find(x => x.link === path)), 1);
    this.listAttack = this.listAttack.filter(x => x.link !== path);
    console.log(this.listAttack);
  }
  //#endregion
}
