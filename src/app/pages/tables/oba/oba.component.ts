import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NbToastrService } from '@nebular/theme';
import { IssueService } from 'app/@core/service/issue.service';
import { AssginService } from 'app/@core/service/assign.service';
import { IssueModel } from 'app/@core/models/issue';
import { OBAIssueFilterModel, OBAIssueModel, OBAModel, ProductModel, TeamFormationModel } from 'app/@core/models/issue-type';
import { AssignModel } from 'app/@core/models/assign';
import { V } from '@angular/cdk/keycodes';
import { OBAService } from 'app/@core/service/oba.service';
import { DropListModel } from 'app/@core/models/issue-config';
import { ConfigIssueService } from 'app/@core/service/issue-config.service';
import { NullTemplateVisitor } from '@angular/compiler';
import { Router } from '@angular/router';
import { GuidService } from 'app/@core/service/guid.service';

@Component({
  selector: 'ngx-oba',
  templateUrl: './oba.component.html',
  styleUrls: ['./oba.component.scss']
})
export class OBAComponent implements OnInit {

  constructor(private http: HttpClient,
    private toastrService: NbToastrService,
    private issueService: IssueService,
    private assignService: AssginService,
    private obaService: OBAService,
    private configIssueService: ConfigIssueService,
    private router: Router,
    private guidService: GuidService,

  ) { }

  // drop list
  listFactory: DropListModel[];
  listNPI: DropListModel[];
  selectedFactory: string = 'NBB';
  selectedNPI: string = 'Mass Product';
  dateSelected: Date = new Date();

  obaIssueList: OBAIssueModel[] = [];


  ngOnInit(): void {
    // Check local storage
    let issueOBAFilter: OBAIssueFilterModel = JSON.parse(localStorage.getItem('obaIssueFilter'));
    if (issueOBAFilter) {
      console.log(issueOBAFilter);
      this.selectedFactory = issueOBAFilter.factory;
      this.selectedNPI = issueOBAFilter.npi;
      this.dateSelected = new Date(issueOBAFilter.date);
    }

    this.getListOBAIssue();
    // Get list dropdownlist config
    this.configIssueService.getDropdown('Factory').subscribe(
      result => { this.listFactory = result; }
    );
    this.configIssueService.getDropdown('NPI').subscribe(
      result => this.listNPI = result
    );
  }

  getListOBAIssue() {
    let issueFilter: OBAIssueFilterModel = {
      factory: this.selectedFactory,
      npi: this.selectedNPI,
      date: this.dateSelected,
    }
    // Update local storage
    localStorage.setItem('obaIssueFilter', JSON.stringify(issueFilter));

    this.obaService.getListOBA(issueFilter).subscribe((res: OBAIssueModel[]) => {
      this.obaIssueList = res;
      this.obaIssueList.forEach(issue => {
        this.issueService.getProductByPSN(issue?.pid).subscribe(res => {
          if (res) {
            console.log(res);
            issue.status = 'Updated';
            issue.url = res.issueId;
          }
        });
      });
      // update status.
      console.log(this.obaIssueList);
    });
  }
  newIssueDetail(obaIssue: OBAIssueModel) {
    this.router.navigateByUrl('/pages/tables/create-issue/' + this.guidService.getGuid() + '/new' + '/openIssue', { state: obaIssue });
  }
  openIssueDetail(isssueId: OBAIssueModel) {
    this.router.navigate(['/pages/tables/create-issue/' + isssueId + '/open' + '/openIssue']);
  }
  openReport(isssueId: OBAIssueModel) {
    this.router.navigate(['/pages/tables/report/' + isssueId]);
  }
}


