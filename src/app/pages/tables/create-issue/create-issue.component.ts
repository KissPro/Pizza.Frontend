import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NbDialogService, NbToastrService } from '@nebular/theme';
import { FileModel } from 'app/@core/models/file-attach';
import { IssueModel } from 'app/@core/models/issue';
import { DropListModel } from 'app/@core/models/issue-config';
import { MailModel, OBAIssueModel, OBAModel, ProcessModel, ProductModel } from 'app/@core/models/issue-type';
import { Mail } from 'app/@core/models/mail';
import { AdwebService } from 'app/@core/service/adweb.service';
import { AuthenticationService } from 'app/@core/service/authentication.service';
import { GuidService } from 'app/@core/service/guid.service';
import { ConfigIssueService } from 'app/@core/service/issue-config.service';
import { IssueService } from 'app/@core/service/issue.service';
import { MailService } from 'app/@core/service/mail.service';
import { UploadService } from 'app/@core/service/upload-file.service';
import { ToastrComponent } from 'app/pages/modal-overlays/toastr/toastr.component';
import { format } from 'date-fns';
import { environment } from 'environments/environment';
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
  IssueType: string = ''; // New - Open
  IssueStep: string = ''; // 4 Step init

  IssueIndex: number = 0; // default is 0 - định danh id
  IssueTitleIndex: number = 0; // đã sãy ra bao nhiêu lần. (sym repeat)
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

  obaIssue: OBAIssueModel;

  alert = new ToastrComponent(this.toastrService);

  ngOnInit() {
    // Get value from route    
    this.route.params.subscribe(params => {
      console.log(params['step']);
      this.IssueID = params['issueId'] == undefined ? this.guidService.getGuid() : params['issueId'];
      this.IssueType = params['type'] == undefined ? 'new' : params['type'];
      this.IssueStep = params['step'] == undefined ? 'openIssue' : params['step'];
      this.obaIssue = history.state // get oba from oba issue list.
    });
    this.showIssueOpen();

    // Get list dropdownlist config
    this.issueService.getListProcess().subscribe(
      result => { this.listProcess = result; }
    );
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

  //#region CHANGE ISSUE SCREEN

  clickStep(step: string) {
    // check this step with current status
    // when review to submit -> view all
    // if (this.issueFormGroup.value?.currentStep == 'Close')
    this.currentStatus = step;
  }

  ngAfterViewInit(): void {
    this.currentStatus = this.IssueStep;
    // this.updateIssueNo();
    // this.updateIssueTitle();
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

  //#endregion

  // Get information from server base on issueId
  async showIssueOpen() {
    // Clear information before
    this.issueFormGroup.reset();
    this.obaFormGroup.reset();
    this.productFormGroup.reset();

    let issueModel = await this.issueService.getIssueById(this.IssueID).toPromise();

    if (issueModel) {
      // Select process type
      this.currentProcess = await this.issueService.getProcessByName(issueModel.processType.toUpperCase()).toPromise();

      // Show Issue common information
      this.createdDate = issueModel?.createdDate ? issueModel.createdDate : new Date();

      this.issueFormGroup.patchValue({
        processType: issueModel.processType,
        issueNo: issueModel.issueNo,
        title: issueModel.title,
        carNo: issueModel.carNo,
        severity: issueModel.severity,
        repeatedCause: issueModel.repeatedCause,
        repeatedSymptom: issueModel.repeatedSymptom,
        failureDesc: issueModel.failureDesc ? issueModel.failureDesc : '<p></p>',
        fileAttack: null,
        notifiedList: issueModel.notifiedList,
        issueStatus: issueModel.issueStatus,
        currentStep: issueModel.currentStep,
        stepStatus: issueModel.stepStatus,
        createdDate: issueModel.createdDate,
        createdBy: issueModel.createdBy,
        createByName: issueModel.createByName,
      })
      // Show list notification
      let emailList = issueModel.notifiedList?.split(';');
      emailList.forEach(email => {
        this.emailNoti = email;
        this.checkMailInformation();
      });

      if (issueModel.processType === 'OBA' || issueModel.processType === 'CAPA') {
        // Select process type
        this.issueService.getProcessByName('OBA').subscribe(result => {
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
            detectBy: result.detectBy,
            howToDetect: result.howToDetect,
            failureValidate: result.failureValidate,
            auditor: result.auditor,
            supervisor: result.supervisor,
            updatedDate: result.updatedDate
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
          // this.IssueTitleIndex = issueModel.repeatedSymptom ? Number(issueModel.repeatedSymptom) : 0;
          // Load issue no and title after load full data
          this.updateIssueNo();
          this.updateIssueTitle();
        })
      }
    } else if (this.obaIssue.pid?.length > 0) {
      console.log(this.obaIssue);

      this.currentProcess = await this.issueService.getProcessByName('OBA').toPromise();
      // Update issue information
      this.issueFormGroup.patchValue({
        failureDesc: `<p>${this.obaIssue.faiL_DESC2}</p>`,
        processType: issueModel.processType,
        carNo: 'N/A',
        severity: 'Major',
        repeatedSymptom: 'TBD',
        repeatedCause: 'TBD',
        createdBy: this.userService.userId(),
        createByName: this.userService.userName(),
      })
      // Shows OBA
      // Check dropdownlist first
      await this.checkDropListContain('Defect Part', this.obaIssue.failurE_COMPONENT_DESC).then(async () => {
        await this.checkDropListContain('Defect Type', this.obaIssue.failurE_MODE_DESC);
      }).then(() => {
        this.obaFormGroup.patchValue({
          issueId: this.IssueID,
          detectingDate: null,
          detectingTime: null,
          defectPart: this.obaIssue.failurE_COMPONENT_DESC,
          defectName: this.obaIssue.failurE_CLASSIFICATION_DESC,
          defectType: this.obaIssue.failurE_MODE_DESC,
          samplingQty: null,
          ngphoneOrdinal: '',
          detectBy: '',
          howToDetect: '',
          failureValidate: '',
          auditor: this.obaIssue.auditor,
          supervisor: this.obaIssue.supervisor,
          updatedDate: this.obaIssue.updateD_DATE,
        })
      })

      // Show Product
      this.productFormGroup.patchValue({
        issueId: this.IssueID,
        imei: this.obaIssue.pid,
        customer: '',
        product: this.obaIssue.family,
        psn: this.obaIssue.pid,
        ponno: '',
        ponsize: '',
        spcode: '',
        line: this.obaIssue.line,
        pattern: '',
        shift: '',
      })

      // this.IssueTitleIndex = issueModel.repeatedSymptom ? Number(issueModel.repeatedSymptom) : 0;
      // Load issue no and title after load full data
      this.updateIssueNo();
      this.updateIssueTitle();

    }
    else {
      this.issueFormGroup.patchValue({
        failureDesc: '<p></p>',
        createdBy: this.userService.userId(),
        createByName: this.userService.userName(),
      })
    }
  }

  async checkDropListContain(name: string, value: string) {
    let listConfig = await this.configIssueService.getDropdown(name).toPromise();
    if (!listConfig.find(x => x.value == value)) {
      const newId = this.guidService.getGuid();
      const config = {
        'id': newId,
        'name': name,
        'value': value,
        'updatedBy': this.userService.userName(),
        'updatedDate': new Date(),
        'dropListRemark': 'Auto inserted',
      };
      this.configIssueService.createOrUpdateConfig(config).toPromise();
    }
  }

  checkPermissionShow() {
    let userId = this.userService.userId();
    if (
      // initiator role
      userId.toUpperCase() == (this.issueFormGroup.value?.createdBy && this.issueFormGroup.value?.createdBy.toUpperCase())
      // admin role
      || this.userService.listRole().indexOf("Hanoi_NBB_PIZZA_ADMIN") !== -1
      || this.userService.listRole().indexOf("Hanoi_NBB_PIZZA_CONTROLLER") !== -1
    )
      return true;
    return false;
  }

  updateRickText(value: string) {
    this.issueFormGroup.patchValue({ failureDesc: value })
  }

  // ACTION WHEN CHANGE PROCESS TYPE
  changeProcess(event: any) {
    this.currentProcess = event;

    // Update issue title
    this.updateIssueNo();
    this.updateIssueTitle();

    // clear form
    this.issueFormGroup.reset();
    this.obaFormGroup.reset();
    this.productFormGroup.reset();

    // patch default value
    this.issueFormGroup.patchValue({
      failureDesc: '<p></p>',
      carNo: 'N/A',
      severity: 'Major',
      repeatedSymptom: 'TBD',
      repeatedCause: 'TBD',
      createdBy: this.userService.userId(),
      createByName: this.userService.userName(),
    })
  }

  //#region MAIL NOTIFICATION
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


  // - NBB : DOHA, PCM, QUE, KIG, NEB, KIG, RETRO, QEN, NEB, NEB, LIO, SPARKLER, GMN, SUEZ, DUBA, GMN, NKL, KIG, CNT, NEO, QEN, OTR, KESA, BTS, PIS
  // - BLU : BT1
  // - FLC : KE11, KE13, KE15, KE16

  // getCustomerName(customer: string) {
  //   const listNBB = ['DOHA', 'PCM', 'QUE', 'KIG', 'NEB', 'KIG', 'RETRO', 'QEN', 'NEB', 'NEB', 'LIO', 'SPARKLER', 'GMN', 'SUEZ', 'DUBA', 'GMN', 'NKL', 'KIG', 'CNT', 'NEO', 'QEN', 'OTR', 'KESA', 'BTS', 'PIS']
  //   const listBLU = ['BT1']
  //   const listFLC = ['KE11', 'KE13', 'KE15', 'KE16']
  //   if (listBLU.includes(customer))
  //     return 'BLU'
  //   else if (listNBB.includes(customer))
  //     return 'NBB'
  //   else if (listFLC.includes(customer))
  //     return 'FLC'
  //   else
  //     return customer.toUpperCase();
  // }

  // GET DATA FROM iFUSE BY IMEI OR PSN
  getInforByIMEI(imei: string) {
    console.log(imei);
    this.loading = true;
    this.issueService.getIMEIInformation(imei).subscribe(
      result => {
        if (result.length > 0) {
          this.productFormGroup.patchValue({
            imei: result[0].imei,
            customer: '',
            product: result[0].product,
            psn: result[0].psn,
            ponno: result[0].ponno,
            ponsize: result[0].ponsize,
            spcode: result[0].spcode,
            line: result[0].line,
            shift: (new Date(result[0].shift).getHours() >= 8 && new Date(result[0].shift).getHours() < 20) ? 'Day' : 'Night',
          })
        } else {
          this.alert.showToast('danger', 'Error', 'IMEI or PSN not contain in the system!');
          // this.productFormGroup.reset();
        }
        this.loading = false;
        this.updateIssueNo();
        this.updateIssueTitle();
      }
    );
  }

  //#region Auto Assign Issue Number, Title

  initIssueNo() {
    let issueNo = '';
    issueNo += this.productFormGroup.value?.product ? (this.productFormGroup.value?.product + '-') : '';
    issueNo += this.currentProcess.processName ? this.currentProcess.processName : '';
    issueNo += '-' + (this.createdDate ? format(new Date(this.createdDate), "yyyyMMdd").toString() : format(new Date(), "yyyyMMdd").toString());
    issueNo += '-' + this.IssueIndex;
    return issueNo;
  }
  initIssueTitle() {
    let issueTitle = '';
    issueTitle += this.productFormGroup.value?.product ? (this.productFormGroup.value?.product + '-') : '';
    issueTitle += this.currentProcess.processName ? this.currentProcess.processName : '';
    issueTitle += this.obaFormGroup.value?.defectPart ? '-' + this.obaFormGroup.value.defectPart : '';
    issueTitle += this.obaFormGroup.value?.defectType ? '-' + this.obaFormGroup.value.defectType : '';
    issueTitle += '-' + (this.createdDate ? format(new Date(this.createdDate), "yyyyMMdd").toString() : format(new Date(), "yyyyMMdd").toString());
    issueTitle += '-' + this.IssueTitleIndex;
    return issueTitle;
  }

  updateIssueNo() {
    if (this.issueFormGroup.value?.issueStatus == 'Draft' || !this.issueFormGroup.value?.issueStatus)
      this.issueService.getListIssueByIssueNo(this.initIssueNo()).toPromise().then(result => {
        // Nếu đang mở - không tăng index
        // this.IssueIndex = (Number(result.length) > 0 && this.IssueType == 'open') ? Number(result.length) - 1 : Number(result.length);
        this.IssueIndex = Number(result.length);
      }).then(() => {
        this.issueFormGroup.patchValue({
          issueNo: this.initIssueNo(),
        })
      })
  }


  updateIssueTitle() {
    if (this.issueFormGroup.value?.issueStatus == 'Draft' || !this.issueFormGroup.value?.issueStatus)
      this.issueService.getListIssueByIssueTitle(this.initIssueTitle()).toPromise().then(result => {
        // this.IssueTitleIndex = (Number(result.length) > 0 && this.IssueType == 'open') ? Number(result.length) - 1 : Number(result.length);
        this.IssueTitleIndex = Number(result.length);
      }).then(() => {
        this.issueFormGroup.patchValue({
          title: this.initIssueTitle(),
        })
      })
    else
      this.IssueTitleIndex = this.issueFormGroup.value?.repeatedSymptom;
  }
  //#endregion

  async submitForm() {
    let result = await this.saveIssueInformation('Open');
    console.log(result);
    // Send email
    if (result == true) {
      const mail: Mail = {
        sender: 'Pizza Systems',
        to: this.listNotify.map(x => x.email).join(";"),
        cc: '',
        bcc: this.userService.email(),
        subject: 'Notification-' + this.issueFormGroup.value?.title,
        content:
          "You have received a Notification in Pizza system.</br>" +
          "Issue number: " + this.issueFormGroup.value?.issueNo + "</br>" +
          "Requester: " + this.userService.userName() + "</br>" +
          "Please follow below link to view : <a href='" + environment.clientUrl + "/pages/tables/create-issue;issueId=" + this.IssueID + ";type=open;step=openIssue" + "'>Pizza - Open Issue</a></br></br>" +
          "Best regards," +
          "</br><a href='" + environment.clientUrl + "'>Pizza System</a></br>"
      }
      this.mailService.SendMail(mail).subscribe(result => result ? this.issueFormGroup.patchValue({
        issueStatus: 'Open',
      }) : console.log('send mail error!'));
    }
  }
  saveDraft() {
    this.saveIssueInformation('Draft');
  }

  async saveIssueInformation(issueStatus: string) {
    let finalResult;
    let errorMessage: string;

    // Validation
    if (this.listNotify.length === 0) {
      errorMessage = 'You need input notification list!';
    }
    else if (this.issueFormGroup.invalid) {
      errorMessage = 'Kindly check issue information!';
    }
    else if ((this.currentProcess.processName === 'OBA' || this.currentProcess.processName === 'CAPA')
      && (this.obaFormGroup.invalid || this.productFormGroup.invalid)) {
      errorMessage = 'Kindly check required field!';
    }
    if (errorMessage) {
      this.alert.showToast('warning', 'Warning', errorMessage);
      return false;
    }

    else {
      const issueNew: IssueModel = {
        id: this.IssueID,
        processType: this.currentProcess.processName,
        issueNo: this.initIssueNo(),
        title: this.initIssueTitle(),
        carNo: this.issueFormGroup.value?.carNo,
        severity: this.issueFormGroup.value?.severity,
        repeatedSymptom: this.issueFormGroup.value?.repeatedSymptom,
        repeatedCause: this.issueFormGroup.value?.repeatedCause,
        failureDesc: this.issueFormGroup.value?.failureDesc,
        fileAttack: this.issueFormGroup.value?.fileAttack,
        notifiedList: this.listNotify.map(x => x.email).join(";"),
        issueStatus: issueStatus,
        currentStep: 'Open',
        stepStatus: 'On-going',
        createdDate: new Date(),
        createdBy: this.userService.userId(),
        createByName: this.userService.userName(),
      }
      this.issueService.createIssue(issueNew)
        .subscribe(async result => {
          if (result == true) {
            // Check process type.
            // Type : OBA -> Insert tblOBA, tblProduct
            if (this.currentProcess.processName === 'OBA' || this.currentProcess.processName === 'CAPA') {
              const obaNew: OBAModel = {
                'id': this.obaFormGroup.value?.issueId ? this.obaFormGroup.value.issueId : this.guidService.getGuid(),
                'issueId': this.IssueID,
                'detectingTime': new Date(format(new Date(this.obaFormGroup.value?.detectingDate), 'yyyy/MM/dd') + ' ' + this.obaFormGroup.value?.detectingTime),
                'defectPart': this.obaFormGroup.value?.defectPart,
                'defectName': this.obaFormGroup.value?.defectName,
                'defectType': this.obaFormGroup.value?.defectType,
                'samplingQty': this.obaFormGroup.value?.samplingQty,
                'ngphoneOrdinal': this.obaFormGroup.value?.ngphoneOrdinal,
                'detectBy': this.obaFormGroup.value?.detectBy,
                'howToDetect': this.obaFormGroup.value?.howToDetect,
                'failureValidate': this.obaFormGroup.value?.failureValidate,
                'auditor': this.obaFormGroup.value?.auditor,
                'supervisor': this.obaFormGroup.value?.supervisor,
                'updatedDate': this.obaFormGroup.value?.updatedDate,
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
          if (finalResult != false)
            this.alert.showToast('success', 'Success', 'Save issue successfully!');
        });
      return true;
    }
  }

  //#region Form Definition
  // Issue information general
  issueFormGroup: FormGroup = this.formBuilder.group({
    processType: null,
    issueNo: '',
    title: '',
    carNo: 'N/A',
    severity: 'Major',
    repeatedSymptom: '',
    repeatedCause: '',
    failureDesc: '<p></p>',
    fileAttack: null,
    notifiedList: '',
    issueStatus: '',
    currentStep: '',
    stepStatus: '',
    createdDate: new Date(),
    createdBy: this.userService.userId(),
    createByName: this.userService.userName(),
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
    detectBy: '',
    howToDetect: '',
    failureValidate: '',
    auditor: '',
    supervisor: '',
    updatedDate: null,
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
