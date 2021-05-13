import { NgModule } from '@angular/core';
import { NbAccordionModule, NbActionsModule, NbButtonModule, NbCardModule,
  NbDatepickerModule, NbDialogService, NbFormFieldModule, NbIconModule, NbInputModule,
  NbListModule,
  NbProgressBarModule,
  NbSelectModule,
  NbSpinnerModule,
  NbStepperModule,
NbTabsetModule, NbTreeGridModule, NbWindowModule } from '@nebular/theme';
import { Ng2SmartTableModule } from 'ng2-smart-table';

import { ThemeModule } from '../../@theme/theme.module';
import { TablesRoutingModule, routedComponents } from './tables-routing.module';
import { FsIconComponent } from './tree-grid/tree-grid.component';
import { DataTablesModule } from 'angular-datatables';
import { COOService } from 'app/@core/mock/coo.service';
import { BoomEcusService } from 'app/@core/service/boom-ecus.service';
import { DNService } from 'app/@core/service/dn.service';
import { CountryShipService } from 'app/@core/service/country-ship.service';
import { GuidService } from 'app/@core/service/guid.service';
import { ModalOverlaysModule } from '../modal-overlays/modal-overlays.module';
import { PlantService } from 'app/@core/service/plant.service';
import { ConfigService } from 'app/@core/service/config.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DNMComponent } from './dn/dnm.component';
import { IssueService } from 'app/@core/service/issue.service';
import { ConfigIssueService } from 'app/@core/service/issue-config.service';
import { AssginService } from 'app/@core/service/assign.service';
import { UploadFileComponent } from './common/upload-file/upload-file.component';
import { MailService } from 'app/@core/service/mail.service';
import { AdwebService } from 'app/@core/service/adweb.service';
import { ApprovalService } from 'app/@core/service/issue-approval.service';
import { OBAService } from 'app/@core/service/oba.service';

@NgModule({
  imports: [
    NbCardModule,
    NbTreeGridModule,
    NbTabsetModule,
    NbWindowModule,
    NbProgressBarModule,
    NbIconModule,
    NbSpinnerModule,
    NbAccordionModule,
    NbFormFieldModule,
    NbStepperModule,
    NbInputModule,
    NbSelectModule,
    NbListModule,
    ThemeModule,
    TablesRoutingModule,
    Ng2SmartTableModule,
    DataTablesModule,
    ModalOverlaysModule,
    FormsModule,
    NbDatepickerModule,
    NbButtonModule,
    NbActionsModule,
    ReactiveFormsModule,
  ],
  declarations: [
    ...routedComponents,
    FsIconComponent,
  ],
  providers: [COOService, BoomEcusService, DNService, 
              CountryShipService, GuidService, PlantService, 
              ConfigIssueService,
              AssginService, MailService,
              AdwebService, ApprovalService,
              OBAService,
              ConfigService, IssueService],
})
export class TablesModule { }
