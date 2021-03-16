import { ViewportScroller } from '@angular/common';
import { nullSafeIsEquivalent } from '@angular/compiler/src/output/output_ast';
import { resolveSanitizationFn } from '@angular/compiler/src/render3/view/template';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, PatternValidator, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NbDialogService, NbToastrService } from '@nebular/theme';
import { FileModel } from 'app/@core/models/file-attach';
import { IssueModel } from 'app/@core/models/issue';
import { DropListModel } from 'app/@core/models/issue-config';
import { MailModel, OBAModel, ProcessModel, ProductModel, UploadFileModel } from 'app/@core/models/issue-type';
import { Mail } from 'app/@core/models/mail';
import { AdwebService } from 'app/@core/service/adweb.service';
import { AuthenticationService } from 'app/@core/service/authentication.service';
import { GuidService } from 'app/@core/service/guid.service';
import { ConfigIssueService } from 'app/@core/service/issue-config.service';
import { IssueService } from 'app/@core/service/issue.service';
import { MailService } from 'app/@core/service/mail.service';
import { UploadService } from 'app/@core/service/upload-file.service';
import { DialogUploadFileComponent } from 'app/pages/modal-overlays/dialog/dialog-upload-file/dialog-upload-file.component';
import { ToastrComponent } from 'app/pages/modal-overlays/toastr/toastr.component';
import { format, isThisSecond } from 'date-fns';
import { merge, parseHTML } from 'jquery';
import { forkJoin, Observable, of } from 'rxjs';
import { UploadFileComponent } from '../common/upload-file/upload-file.component';



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
    private mailService: MailService,
    private ref: ChangeDetectorRef,
    public router: Router,
    public route: ActivatedRoute
  ) { }
  @ViewChild('step') step;
  @ViewChild(UploadFileComponent) fileUpload: UploadFileComponent;

  IssueID: string = '';
  IssueIndex: number = 1; // default is 1 - định danh id
  IssueTitleIndex: number = 0; // đã sãy ra bao nhiêu lần. (sym repeat)
  IssueType: string = ''; // New - Open
  IssueStep: string = ''; // 4 Step init

  createdDate: Date = null;

  loading = false;
  currentProcess: ProcessModel = null;
  currentStatus: string = 'openIssue';
  // currentStatus: string = 'caca';
  // currentStatus: string = 'capa';

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



  ngOnInit() {
    this.route.params.subscribe(params => {
      console.log(params['step']);
      this.IssueID = params['issueId'] == undefined ? this.guidService.getGuid() : params['issueId'];
      this.IssueType = params['type'];
      this.IssueStep = params['step'];
    });
    this.showIssueOpen();

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


  clickStep(step: string) {
    // check this step with current status
    this.currentStatus = step;
  }

  ngAfterViewInit(): void {
    this.currentStatus = this.IssueStep;
    // if (this.currentStatus == 'openIssue')
    // {

    // }
    // set current step
    // this.step.next();
    // this.step.next();
    // this.step.next();
    // this.step.previous();

    this.ref.detectChanges(); // giá trị thay đổi sau khi đã kiểm tra thì thêm thằng này.
  }

  // Control Stepper
  next(nextStatus: string) {
    this.gotoTop();
    this.currentStatus = 'loading';
    setTimeout(() => {
      this.currentStatus = nextStatus;
    }, 1);
    this.step.next();
  }
  previous(previus: string) {
    this.gotoTop();
    this.currentStatus = 'loading';
    setTimeout(() => {
      this.currentStatus = previus;
    }, 1);
    this.step.previous();
  }

  async gotoTop() {
    // goto top
    let top = document.getElementById('GoToTop');
    if (top !== null) {
      top.scrollIntoView();
      top = null;
    }
  }


  // Get information from server base on issueId
  async showIssueOpen() {
    // this.IssueID = '2D864EC3-3DBC-4C06-BC12-31E50D880B16';
    let issueModel = await this.issueService.getIssueById(this.IssueID).toPromise();
    if (issueModel) {
      // Select process type
      this.currentProcess = await this.issueService.getProcessByName('OBA').toPromise();
      // Show Issue common information
      this.createdDate = issueModel?.createdDate ? issueModel.createdDate : new Date();

      this.issueFormGroup.patchValue({
        processType: issueModel.processType,
        issueNo: issueModel.issueNo,
        title: issueModel.title,
        rpn: issueModel.rpn,
        severity: issueModel.severity,
        repeateddSymptom: issueModel.repeateddSymptom,
        failureDesc: issueModel.failureDesc ? issueModel.failureDesc : '<p></p>',
        fileAttack: null,
        notifiedList: issueModel.notifiedList,
        issueStatus: issueModel.issueStatus,
        currentStep: issueModel.currentStep,
        stepStatus: issueModel.stepStatus,
        createdDate: issueModel.createdDate,
        createdBy: issueModel.createdBy,
      })

      // Show list notfication
      let emailList = issueModel.notifiedList?.split(';');
      emailList.forEach(email => {
        this.emailNoti = email;
        this.checkMailInformation();
      });



      if (issueModel.processType === 'OBA') {
        // Select process type
        this.issueService.getProcessByName(issueModel.processType).subscribe(result => {
          this.currentProcess = result;
          //console.log(this.currentProcess);
        })
        // Shows OBA
        await this.issueService.getOBAById(this.IssueID).toPromise().then(result => {
          this.obaFormGroup.patchValue({
            issueId: result.issueId,
            detectingDate: new Date(result.detectingTime),
            detectingTime: format(new Date(result.detectingTime), 'HH:mm'),
            defectPart: result.defectPart,
            defectName: result.defectName,
            defectType: result.defectType,
            samplingQty: result.samplingQty,
            ngphoneOrdinal: result.ngphoneOrdinal,
          })
        })
        // Show Product
        this.issueService.getProductById(this.IssueID).toPromise().then(result => {
          this.productFormGroup.patchValue({
            issueId: result.issueId,
            imei: result.imei,
            customer: result.customer,
            product: result.product,
            psn: result.psn,
            ponno: result.ponno,
            ponsize: result.ponsize,
            spcode: result.spcode,
            line: result.line,
            pattern: result.pattern,
            shift: result.shift,
          })
        }).then(() => {
          // this.IssueTitleIndex = issueModel.repeateddSymptom ? Number(issueModel.repeateddSymptom) : 0;
        })
      }
    } else {
      this.issueFormGroup.patchValue({
        failureDesc: '<p></p>',
      })
    }
  }

  updateRickText(value: string) {
    this.issueFormGroup.patchValue({ failureDesc: value })
  }

  changeProcess(event: any) {
    this.currentProcess = event;

    //console.log(this.currentProcess);
    this.issueFormGroup.reset();
    this.obaFormGroup.reset();
    this.productFormGroup.reset();
  }

  //#region Mail notification
  async checkMailInformation() {
    let newMail: MailModel;
    newMail = {
      name: this.nameNoti,
      empId: this.idNoti,
      email: this.emailNoti,
      team: 'FUSHAN'
    };
    var token = JSON.parse(localStorage.getItem('user')).token["access_token"];
    let result;
    if (this.emailNoti != null && this.emailNoti != '') {
      result = await this.adwebService.getUserDetailByEmail(token, this.emailNoti).toPromise();
    }
    else if (this.nameNoti != null && this.nameNoti != '') {
      result = await this.adwebService.getUserDetailByName(token, this.nameNoti).toPromise();
    }
    else if (this.idNoti != null && this.idNoti != '') {
      result = await this.adwebService.getUserDetailByID(token, this.idNoti).toPromise();
    }
    if (result != null) {
      newMail = {
        name: result['ad_user_displayName'],
        empId: result['ad_user_employeeID'],
        email: result['work_email'],
        team: result['department_id'][1]
      };
      this.updateMailInformation(newMail);
    }
    // clear textbox
    this.emailNoti = null;
    this.nameNoti = null;
    this.idNoti = null;
    this.listNotify.push(newMail);
  }
  updateMailInformation(mail: MailModel) {
    // update
    let itemIndex = this.listNotify.findIndex(x => x.email == mail.email || x.name == mail.name || x.empId == mail.empId);
    this.listNotify[itemIndex] = mail;

  }
  removeNoti(mail: string) {
    this.listNotify = this.listNotify.filter(x => x.email !== mail);
  }
  //#endregion

  getInforByIMEI(imei: string) {
    this.loading = true;
    this.issueService.getIMEIInformation(imei).subscribe(
      result => {
        if (result.length > 0) {
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
        this.updateIssueIndex();
        this.updateIssueTitle();
      }
    );
  }

  //#region Auto Assign Issue Number, Title
  initIssueTitle() {
    let issueTitle = '';
    issueTitle += this.productFormGroup.value?.customer !== null && this.productFormGroup.value?.customer !== '' ? (this.productFormGroup.value.customer + '-') : '';
    issueTitle += this.currentProcess != null ? this.currentProcess.processName : '';
    issueTitle += this.productFormGroup.value?.product !== null ? ('-' + this.productFormGroup.value.product) : '';
    issueTitle += ((this.obaFormGroup.value?.defectPart !== '' && this.obaFormGroup.value?.defectPart !== null) ? ('-' + this.obaFormGroup.value.defectPart) : '');
    issueTitle += ((this.obaFormGroup.value?.defectName !== '' && this.obaFormGroup.value?.defectName !== null) ? ('-' + this.obaFormGroup.value.defectName) : '');
    issueTitle += ((this.obaFormGroup.value?.defectType !== '' && this.obaFormGroup.value?.defectType !== null) ? ('-' + this.obaFormGroup.value.defectType) : '');
    issueTitle += '-' + (this.createdDate ? format(new Date(this.createdDate), "yyyyMMdd").toString() : format(new Date(), "yyyyMMdd").toString());
    issueTitle += '-' + this.IssueTitleIndex;
    return issueTitle;
  }
  initIssueNo() {
    let issueNo = '';
    issueNo += this.productFormGroup.value?.customer !== null && this.productFormGroup.value?.customer !== '' ? (this.productFormGroup.value.customer + '-') : '';
    issueNo += ((this.currentProcess != null) ? this.currentProcess.processName : '');
    issueNo += '-' + (this.createdDate ? format(new Date(this.createdDate), "yyyyMMdd").toString() : format(new Date(), "yyyyMMdd").toString());
    issueNo += '-' + this.IssueIndex;

    return issueNo;
  }
  updateIssueIndex() {
    this.issueService.getListIssueByIssueNo(this.initIssueNo()).toPromise().then(result => {
      this.IssueIndex = result.length + ((this.IssueType == 'open') ? 0 : 1);
    }).then(() => {
      this.issueFormGroup.patchValue({
        issueNo: this.initIssueNo(),
      })
    })
  }
  updateIssueTitle() {
    this.issueService.getListIssueByIssueTitle(this.initIssueTitle()).toPromise().then(result => {
      this.IssueTitleIndex = result.length + ((this.IssueType == 'open') ? -1 : 0);
    }).then(() => {
      this.issueFormGroup.patchValue({
        title: this.initIssueTitle(),
      })
    })
  }
  //#endregion
  submitForm() {
    // Send email
    const mail: Mail = {
      sender: 'Pizza Tool',
      to: this.listNotify.map(x => x.email).join(";"),
      cc: '',
      bcc: '',
      subject: 'Notification-' + this.initIssueTitle(),
      content: "This is test email"
    }
    this.mailService.SendMail(mail).subscribe(result => {
      console.log(result);
    });
    this.saveIssueInformation('Open');
  }

  saveDraft() {
    this.saveIssueInformation('Draft');
  }

  async saveIssueInformation(issueStatus: string) {
    let finalResult;
    if (this.listNotify.length === 0) {
      this.alert.showToast('warning', 'Warning', 'You need input notification list!');
      return;
    }
    const issueNew: IssueModel = {
      id: this.IssueID,
      processType: this.currentProcess.processName,
      issueNo: this.initIssueNo(),
      title: this.initIssueTitle(),
      rpn: this.issueFormGroup.value?.rpn,
      severity: this.issueFormGroup.value?.rpn < 100 ? 'Major' : 'Critical',
      repeateddSymptom: this.IssueTitleIndex,
      failureDesc: this.issueFormGroup.value?.failureDesc,
      fileAttack: this.issueFormGroup.value?.fileAttack,
      notifiedList: this.listNotify.map(x => x.email).join(";"),
      issueStatus: issueStatus,
      currentStep: 'Open',
      stepStatus: 'On-going',
      createdDate: new Date(),
      createdBy: this.userService.userId(),
    }
    this.issueService.createIssue(issueNew)
      .subscribe(async result => {
        if (result == true) {
          // Check process type.
          // Type : OBA -> Insert tblOBA, tblProduct
          if (this.currentProcess.processName === 'OBA') {
            const obaNew: OBAModel = {
              'id': this.obaFormGroup.value?.issueId ? this.obaFormGroup.value.issueId : this.guidService.getGuid(),
              'issueId': this.IssueID,
              'detectingTime': new Date(format(new Date(this.obaFormGroup.value?.detectingDate), 'yyyy/MM/dd') + ' ' + this.obaFormGroup.value?.detectingTime),
              'defectPart': this.obaFormGroup.value?.defectPart,
              'defectName': this.obaFormGroup.value?.defectName,
              'defectType': this.obaFormGroup.value?.defectType,
              'samplingQty': this.obaFormGroup.value?.samplingQty,
              'ngphoneOrdinal': this.obaFormGroup.value?.ngphoneOrdinal,
            };
            finalResult = await this.issueService.createOBA(obaNew).toPromise();
            const productNew: ProductModel = {
              'id': this.productFormGroup.value?.issueId ? this.productFormGroup.value.issueId : this.guidService.getGuid(),
              'issueId': this.IssueID,
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
            await this.fileUpload.insertListDB();
            finalResult = await this.issueService.createProduct(productNew).toPromise();
          }
        }
        if (finalResult == true)
          this.alert.showToast('success', 'Success', 'Save issue successfully!');
      });
  }


  //#region Form Definition
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
    createdDate: new Date(),
    createdBy: '',
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
}
