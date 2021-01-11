import { HttpClient, HttpEventType } from '@angular/common/http';
import { Component, EventEmitter, Output } from '@angular/core';
import { NbDialogRef, NbToastrService } from '@nebular/theme';
import { UploadService } from 'app/@core/service/upload-file.service';
import { ToastrComponent } from '../../toastr/toastr.component';

@Component({
  selector: 'ngx-dialog-upload-file',
  templateUrl: 'dialog-upload-file.component.html',
  styleUrls: ['dialog-upload-file.component.scss'],
})
export class DialogUploadFileComponent {
  // Send from caller
  type: string; // as folder
  fileName: string;
  urlUpload: string;

  public progress: number;
  public message: string;
  statusProcess: string;
  filePath: any;
  alert = new ToastrComponent(this.toastrService);

  @Output() public onUploadFinished = new EventEmitter();

  constructor(protected ref: NbDialogRef<DialogUploadFileComponent>,
    private http: HttpClient,
    private uploadService: UploadService,
    private toastrService: NbToastrService,
  ) { }

  cancel() {
    if (this.filePath !== undefined)
      this.uploadService.DeleteFile(this.filePath).subscribe();
    console.log(this.filePath);
    this.ref.close();
  }

  public uploadFile = (files) => {
    this.statusProcess = 'success';
    if (files.length === 0) {
      return;
    }
    const fileToUpload = <File>files[0];
    const formData = new FormData();
    formData.append('file', fileToUpload, fileToUpload.name);

    this.uploadService.UploadExcel(formData, this.type)
      .subscribe(
        event => {
          if (event.type === HttpEventType.UploadProgress)
            this.progress = Math.round(100 * event.loaded / event.total);
          else if (event.type === HttpEventType.Response) {
            this.message = 'Upload file success.';
            this.filePath = event.body;
            this.onUploadFinished.emit(event.body);
          }
        },
        error => this.alert.showToast('danger', 'Error', 'Upload file error!'),
      );
  }

  submit() {
    this.statusProcess = 'danger';
    if (this.filePath !== undefined)
      this.uploadService.SubmitUpload(this.urlUpload, this.filePath).
        subscribe(
          () => {
            this.alert.showToast('success', 'Success', 'Upload ' + this.type + 'file successfully!');
            this.ref.close('success');
          },
          error => this.alert.showToast('danger', 'Error', 'Submit error!'),
        );
  }

  downloadTemplate() {
    this.statusProcess = 'info';
    this.uploadService.DownloadFile(this.fileName)
      .subscribe(
        result => this.uploadService.ShowFile(result, this.fileName),
        error => this.alert.showToast('danger', 'Error', 'Download template file error!'),
      );
  }
}
