import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NbToastrService } from '@nebular/theme';
import { IssueService } from 'app/@core/service/issue.service';
import { AssginService } from 'app/@core/service/assign.service';
import { IssueModel } from 'app/@core/models/issue';
import { OBAModel, ProductModel, TeamFormationModel } from 'app/@core/models/issue-type';
import { AssignModel } from 'app/@core/models/assign';
import { V } from '@angular/cdk/keycodes';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'ngx-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit {

  constructor(private http: HttpClient,
    private toastrService: NbToastrService,
    private issueService: IssueService,
    private assignService: AssginService,
    public router: Router,
    public route: ActivatedRoute

  ) { }
  IssueID: string = '';

  IssueData: IssueModel;
  IssueDesc: string = '';
  OBAData: OBAModel;
  ProductData: ProductModel;

  // Assign
  TeamList: TeamFormationModel[] = []; // Team Formation
  CacaList: AssignModel[] = []; // Containment Action
  Caca1List: AssignModel[] = []; // Cause Analysis
  CapaList: AssignModel[] = [];
  CloseList: AssignModel[] = []; // Verify


  ngOnInit(): void {
    // Get value from route    
    this.route.params.subscribe(params => {
      this.IssueID = params['issueId'] == undefined ? '7b92522f-ca9b-4f06-b8c0-9d11469fd264' : params['issueId'];
      this.GetAll();
    });
  }

  async GetAll() {
    // Issue Information
    this.IssueData = await this.issueService.getIssueById(this.IssueID).toPromise();
    this.IssueDesc = $(this.IssueData.failureDesc).text();
    this.OBAData = await this.issueService.getOBAById(this.IssueID).toPromise();
    this.ProductData = await this.issueService.getProductById(this.IssueID).toPromise();


    // Assgin Information
    this.assignService.getListAssign(this.IssueID).subscribe(result => {
      result.forEach((item) => {
        let teamFormation: TeamFormationModel = {
          name: item.name,
          empId: item.ownerId,
          email: item.email,
          team: item.team,
          position: '',
        }
        if (item.currentStep === 'caca') {
          teamFormation.position = "Containment Action";
          this.CacaList.push(item)
        }
        else if (item.currentStep === 'caca1') {
          teamFormation.position = "Cause Analysis";
          this.Caca1List.push(item);
        }
        else if (item.currentStep === 'capa') {
          teamFormation.position = "Corrective & Preventive Action";
          this.CapaList.push(item)
        }
        else if (item.currentStep === 'close') {
          teamFormation.position = "Verify";
          this.CloseList.push(item)
        }
        // add team formation
        if (!this.TeamList.find(x => x.empId == teamFormation.empId && x.position == teamFormation.position)) {
          this.TeamList.push(teamFormation);
        }
      });
    });
  }

}


