import { NgModule } from '@angular/core';
import { NbActionsModule, NbButtonModule, NbCardModule,
  NbDatepickerModule, NbIconModule, NbInputModule,
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


@NgModule({
  imports: [
    NbCardModule,
    NbTreeGridModule,
    NbTabsetModule,
    NbWindowModule,
    NbIconModule,
    NbInputModule,
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
  providers: [COOService, BoomEcusService, DNService, CountryShipService, GuidService, PlantService, ConfigService],
})
export class TablesModule { }
