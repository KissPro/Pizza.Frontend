import { Component, OnDestroy, AfterViewInit, Output, EventEmitter, ElementRef, Input } from '@angular/core';
import { LocationStrategy } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UploadService } from 'app/@core/service/upload-file.service';
import { environment } from 'environments/environment';

@Component({
  selector: 'ngx-tiny-mce',
  template: '<input id="input" type="file" #file (change)="onSelectFile(file.files)" style="display: none;">',
})
export class TinyMCEComponent implements OnDestroy, AfterViewInit {

  @Output() editorKeyup = new EventEmitter<any>();
  @Input() rickText: any;
  editor: any;

  constructor(
    private http: HttpClient,
    private host: ElementRef,
    private locationStrategy: LocationStrategy,
    private uploadService: UploadService,
  ) { }

  onSelectFile(files) { // called each time file input changes
    if (files.length === 0) {
      return;
    }
    const fileToUpload = <File>files[0];
    const formData = new FormData();
    formData.append('file', fileToUpload, fileToUpload.name);

    this.uploadService.UploadImage(formData)
      .subscribe(result => {
        console.log(result);
        if (result['body'] !== undefined)
          tinymce.activeEditor.insertContent('<img src="' + environment.APIPortalURL + result['body'] + '"/>');
      });
  }

  DeleteImage(path: string) {
    const imgPath = path.substr(path.indexOf('/UploadedFile'));
    this.uploadService.DeleteFile(imgPath).subscribe();
  }

  ngAfterViewInit() {
    tinymce.init({
      target: this.host.nativeElement,
      plugins: ['link', 'paste', 'table'],
      skin_url: `${this.locationStrategy.getBaseHref()}assets/skins/lightgray`,
      toolbar: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image imageupload",
      paste_data_images: true,
      // inline: true,
      // menubar: false,
      // toolbar: false
      setup: editor => {
        this.editor = editor;

        // set content
        editor.on('init', () => {
          editor.setContent(this.rickText ? this.rickText : '<p></p>');
        });
        // get context
        editor.on('change', () => {
          this.editorKeyup.emit(editor.getContent());
        });
        // editor.on('ObjectResized', function (e) {
        //   this.editorKeyup.emit(editor.getContent());
        // });

        editor.on('KeyDown', (e) => {
          if ((e.keyCode == 8 || e.keyCode == 46) && editor.selection) { // delete & backspace keys
            var selectedNode = editor.selection.getNode(); // get the selected node (element) in the editor
            if (selectedNode && selectedNode.nodeName == 'IMG') {
              this.DeleteImage(selectedNode.src);
            }
          }
        });

        editor.addButton('imageupload', {
          text: "Upload Image",
          icon: 'image',
          onclick: function () {
            // inp.trigger('click');
            var input = document.getElementById('input');
            input.click();
          }
        });

        // Check image paste
        editor.on('paste', (e) => {
          var imageBlob = this.onPaste(e);
          if (!imageBlob) {
            return;
          }
          e.preventDefault();
          // upload
          const formData = new FormData();
          formData.append("file", imageBlob);
          this.uploadService.UploadImage(formData)
            .subscribe(result => {
              console.log(result);
              if (result['body'] !== undefined)
                tinymce.activeEditor.insertContent('<img src="' + environment.APIPortalURL + result['body'] + '"/>');
            });
        });
      },
      height: '250',
    });
  }

  ngOnDestroy() {
    tinymce.remove(this.editor);
  }

  onPaste(e: any) {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    let blob = null;
    for (const item of items) {
      if (item.type.indexOf('image') === 0) {
        blob = item.getAsFile();
        return blob;
      }
    }
  }
}
