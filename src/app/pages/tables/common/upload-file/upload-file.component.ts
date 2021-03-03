import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NbDialogService, NbToastrService } from '@nebular/theme';
import { FileModel } from 'app/@core/models/file-attach';
import { UploadFileModel } from 'app/@core/models/issue-type';
import { AuthenticationService } from 'app/@core/service/authentication.service';
import { GuidService } from 'app/@core/service/guid.service';
import { IssueService } from 'app/@core/service/issue.service';
import { UploadService } from 'app/@core/service/upload-file.service';
import { DialogUploadFileComponent } from 'app/pages/modal-overlays/dialog/dialog-upload-file/dialog-upload-file.component';
import { ToastrComponent } from 'app/pages/modal-overlays/toastr/toastr.component';

@Component({
  selector: 'ngx-upload-file',
  templateUrl: './upload-file.component.html',
  styleUrls: ['./upload-file.component.scss']
})
export class UploadFileComponent implements OnInit {

  constructor(
    private dialogService: NbDialogService,
    private fileService: UploadService,
    private issueService: IssueService,
    private guidService: GuidService,
    private userService: AuthenticationService,
    private toastrService: NbToastrService,
  ) { }

  ngOnInit(): void {
    this.showListFile();
  }

  // declare
  listAttack: FileModel[] = [];
  @Input() issueId;
  @Input() currentStep;

  @Output() insertResult = new EventEmitter<any>();
  alert = new ToastrComponent(this.toastrService);



  showListFile() {
    if (this.issueId.length > 0)
      this.issueService.getListFileByIssueId(this.issueId).subscribe(result => {
        result.forEach(file => {
          if (file.currentStep === this.currentStep) {
            const newFile: FileModel = {
              id: file.id,
              name: file.name,
              link: file.url,
              type: file.type,
              icon: this.fileService.IconFile(file.type),
            }
            this.listAttack.push(newFile);
          }
        });
      })
  }

  uploadFile(): void {
    this.dialogService.open(DialogUploadFileComponent, {
      context: {
        type: 'Issue',
      },
    }).onClose.subscribe(result => (result !== null) ? this.addAttachList(result) : null);
  }

  addAttachList(file: FileModel) {
    file.id = this.guidService.getGuid();
    this.listAttack.push(file);
    if (this.currentStep != 'OPEN')this.insertServer(file);
  }

  downloadFile(file: FileModel) {
    this.fileService.DownloadFile(file.link, file.type)
      .subscribe(
        result => this.fileService.ShowFile(result, file.name),
      );
  }

  deleteFile(id: string, path: string) {
    let check = true;
    this.fileService.DeleteFile(path).subscribe(result => check == result);
    // this.listAttack.slice(this.listAttack.indexOf(this.listAttack.find(x => x.link === path)), 1);
    this.listAttack = this.listAttack.filter(x => x.link !== path);

    // delete in server
    if (id)
      this.issueService.removeFile(id).subscribe(result => check == result);
    if (check === true) this.alert.showToast('success', 'Success', 'Remove file successfully!');
  }

  insertListDB() {
    this.listAttack.forEach((item) => {
      const fileNew: UploadFileModel = {
        'id': item.id,
        'issueId': this.issueId,
        'currentStep': this.currentStep,
        'type': item.type,
        'name': item.name,
        'url': item.link,
        'remark': '',
        'uploadedBy': this.userService.userId(),
        'uploadedDate': new Date(),
      }
      this.issueService.createFile(fileNew).subscribe(
        result => {
          if (result == true)
            this.alert.showToast('success', 'Success', 'Upload file successfully!');
        },
      );
    })
  }


  insertServer(file: FileModel) {
    const fileNew: UploadFileModel = {
      'id': file.id,
      'issueId': this.issueId,
      'currentStep': this.currentStep,
      'type': file.type,
      'name': file.name,
      'url': file.link,
      'remark': '',
      'uploadedBy': this.userService.userId(),
      'uploadedDate': new Date(),
    }
    this.issueService.createFile(fileNew).subscribe(
      result => {
        if (result == true)
          this.alert.showToast('success', 'Success', 'Upload file successfully!');
      },
    );
  }


}
