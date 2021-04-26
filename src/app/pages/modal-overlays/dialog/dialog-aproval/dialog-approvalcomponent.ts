import { Component } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { NbDialogService } from '@nebular/theme';
import { ApprovalDialogModel } from 'app/@core/models/issue-approval';
@Component({
  selector: 'ngx-dialog-approval',
  templateUrl: 'dialog-approval.component.html',
  styleUrls: ['dialog-approval.component.scss'],
})
export class DialogApprovalComponent {
  constructor(protected ref: NbDialogRef<DialogApprovalComponent>) {}

  remark: string = '';

  cancel() {
    this.ref.close();
  }

  approval(status: number) {
    if (!this.remark) return;
    const approval : ApprovalDialogModel = {
      status : status,
      remark : this.remark,
    };
    this.ref.close(approval);
  }
}
