import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TablesComponent } from './tables.component';
import { DataTablesComponent} from './datatables-js/datatables.component';
import { ConfigComponent } from './config/config.component';
import { IssueComponent } from './issue/issue.component';
import { CreateIssueComponent } from './create-issue/create-issue.component';
import { CacaComponent } from './create-issue/caca/caca.component';
import { UploadFileComponent } from './common/upload-file/upload-file.component';
import { CapaComponent } from './create-issue/capa/capa.component';
import { CloseComponent } from './create-issue/close/close.component';
import { ReportComponent } from './report/report.component';
// import { OBAComponent } from './report copy/oba.component';

const routes: Routes = [{
  path: '',
  component: TablesComponent,
  children: [
    {
      path: 'datatables',
      component: DataTablesComponent,
    },
    {
      path: 'config',
      component: ConfigComponent,
    },
    {
      path: 'issue',
      component: IssueComponent,
    },
    {
      path: 'report',
      component: ReportComponent,
    },
    // {
    //   path: 'oba',
    //   component: OBAComponent,
    // },
    // create issue route
    {
      path: 'create-issue',
      component: CreateIssueComponent,
    },
    {
      path: 'create-issue/:issueId/:type/:step',
      component: CreateIssueComponent,
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TablesRoutingModule { }

export const routedComponents = [
  TablesComponent,
  DataTablesComponent,
  ConfigComponent,
  IssueComponent,
  // OBAComponent,
  ReportComponent,
  CreateIssueComponent,
  CacaComponent,
  CapaComponent,
  CloseComponent,
  UploadFileComponent,
];
