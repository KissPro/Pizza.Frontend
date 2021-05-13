import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TablesComponent } from './tables.component';
import { SmartTableComponent } from './smart-table/smart-table.component';
import { TreeGridComponent } from './tree-grid/tree-grid.component';
import { DataTablesComponent} from './datatables-js/datatables.component';
import { BoomEcusComponent } from './boom-ecus/boom-ecus.component';
import { DNComponent } from './dn/dn.component';
import { CountryShipComponent } from './country-ship/country-ship.component';
import { ConfigComponent } from './config/config.component';
import { PlantComponent } from './plant/plant.component';
import { DNMComponent } from './dn/dnm.component';
import { IssueComponent } from './issue/issue.component';
import { CreateIssueComponent } from './create-issue/create-issue.component';
import { CacaComponent } from './create-issue/caca/caca.component';
import { UploadFileComponent } from './common/upload-file/upload-file.component';
import { CapaComponent } from './create-issue/capa/capa.component';
import { CloseComponent } from './create-issue/close/close.component';

const routes: Routes = [{
  path: '',
  component: TablesComponent,
  children: [
    {
      path: 'smart-table',
      component: SmartTableComponent,
    },
    {
      path: 'tree-grid',
      component: TreeGridComponent,
    },
    {
      path: 'datatables',
      component: DataTablesComponent,
    },
    {
      path: 'boom-ecus',
      component: BoomEcusComponent,
    },
    {
      path: 'dn',
      component: DNComponent,
    },
    {
      path: 'dnm',
      component: DNMComponent,
    },
    {
      path: 'country-ship',
      component: CountryShipComponent,
    },
    {
      path: 'config',
      component: ConfigComponent,
    },
    {
      path: 'plant',
      component: PlantComponent,
    },
    {
      path: 'issue',
      component: IssueComponent,
    },
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
  SmartTableComponent,
  TreeGridComponent,
  DataTablesComponent,
  BoomEcusComponent,
  DNComponent,
  DNMComponent,
  CountryShipComponent,
  ConfigComponent,
  PlantComponent,
  IssueComponent,
  CreateIssueComponent,
  CacaComponent,
  CapaComponent,
  CloseComponent,
  UploadFileComponent,
];
