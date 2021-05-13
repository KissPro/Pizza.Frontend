import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ModalOverlaysComponent } from './modal-overlays.component';
import { DialogComponent } from './dialog/dialog.component';
import { PopoversComponent } from './popovers/popovers.component';
import { ToastrComponent } from './toastr/toastr.component';

const routes: Routes = [{
  path: '',
  component: ModalOverlaysComponent,
  children: [
    {
      path: 'dialog',
      component: DialogComponent,
    },
    {
      path: 'popover',
      component: PopoversComponent,
    },
    {
      path: 'toastr',
      component: ToastrComponent,
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalOverlaysRoutingModule {
}


