import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'ngx-create-issue',
  templateUrl: './create-issue.component.html',
  styleUrls: ['./create-issue.component.scss']
})
export class CreateIssueComponent implements OnInit {

  constructor(
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
  }


  commonSelectedItem = '2';
  selectedItem;

  inputRick= '<p>Hello world!</p>'
  getRickText(value: string){
    console.log(value);
  }
  // Create Form
  // Issue information general
  issueFormGroup: FormGroup = this.formBuilder.group({
    processType: null,
    issueNo: ['', [Validators.required]],
    title: ['', [Validators.required]],
    rpn: [null, [Validators.minLength(50)]],
    severity:'',
    repeateddSymptom: '',
    failureDesc: '',
    fileAttack: null,
    notifiedList: '',
    issueStatus:'',
    currentStep:'',
    stepStatus:'',
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
    detectingTime: '',
    defectPart: '',
    defectName: '',
    defectType: '',
    samplingQty: '',
    ngphoneOrdinal: '',
  });

  // Product table
  productFormGroup: FormGroup = this.formBuilder.group({
    issueId:'',
    imei:'',
    custormer:'',
    product:'',
    psn:'',
    ponno:'',
    ponsize:'',
    spcode:'',
    line:'',
    pattern:'',
    shift:'',
  });
}
