import { HttpClient, HttpEventType } from '@angular/common/http';
import { Component, EventEmitter, Output } from '@angular/core';
import { NbDialogRef, NbToastrService } from '@nebular/theme';
import { FileModel } from 'app/@core/models/file-attach';
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
  templateName: string; 
  urlUpload: string; // for controller upload custome

  public progress: number;
  public message: string;
  statusProcess: string;
  filePath: any;
  alert = new ToastrComponent(this.toastrService);

  // Current file
  private currentFile = {} as FileModel;

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
    this.ref.close(null);
  }

  public uploadFile = (files) => {
    this.statusProcess = 'success';
    if (files.length === 0) {
      return;
    }
    const fileToUpload = <File>files[0];

    console.log(fileToUpload);
    this.currentFile.name = fileToUpload.name; // assign to current file -> to collect information
    this.currentFile.type = fileToUpload.type;
    this.currentFile.icon = this.uploadService.IconFile(fileToUpload.type);

    const formData = new FormData();
    formData.append('file', fileToUpload, fileToUpload.name);

    this.uploadService.UploadFile(formData, this.type)
      .subscribe(
        event => {
          if (event.type === HttpEventType.UploadProgress)
            this.progress = Math.round(100 * event.loaded / event.total);
          else if (event.type === HttpEventType.Response) {
            this.message = 'Upload file success.';
            this.filePath = event.body;
            this.currentFile.link = this.filePath;
            this.onUploadFinished.emit(event.body);
          }
        },
        error => this.alert.showToast('danger', 'Error', 'Upload file error!'),
      );
  }

  submit() {
    this.statusProcess = 'danger';
    if (this.filePath !== undefined)
      // If upload excel -> collect data
      if (this.urlUpload !== undefined) { 
        this.uploadService.SubmitUpload(this.urlUpload, this.filePath).
          subscribe(
            () => {
              this.alert.showToast('success', 'Success', 'Upload ' + this.type + 'file successfully!');
              this.ref.close('success');
            },
            error => this.alert.showToast('danger', 'Error', 'Submit error!'),
          );
      }
      // Basiclly upload file -> return path
      else {
        this.ref.close(this.currentFile);
      }
  }

  downloadTemplate() {
    this.statusProcess = 'info';
    this.uploadService.DownloadFile(this.templateName, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      .subscribe(
        result => this.uploadService.ShowFile(result, this.templateName),
        error => this.alert.showToast('danger', 'Error', 'Download template file error!'),
      );
  }
}
