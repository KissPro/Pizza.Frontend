import { Component } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { NbDialogService } from '@nebular/theme';
@Component({
  selector: 'ngx-dialog-confirm',
  templateUrl: 'dialog-confirm.component.html',
  styleUrls: ['dialog-confirm.component.scss'],
})
export class DialogConfirmComponent {

  constructor(protected ref: NbDialogRef<DialogConfirmComponent>) {}

  cancel() {
    this.ref.close();
  }

  submit() {
    this.ref.close(1);
  }
}
