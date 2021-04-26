import { Component, OnDestroy, AfterViewInit, Output, EventEmitter, ElementRef, Input } from '@angular/core';
import { LocationStrategy } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UploadService } from 'app/@core/service/upload-file.service';
import { environment } from 'environments/environment';

@Component({
  selector: 'ngx-tiny-mce-flat',
  template: '',
})

export class TinyMCEComponentFlat implements OnDestroy, AfterViewInit {

  @Input() rickText: any;
  editor: any;

  constructor(
    private host: ElementRef,
    private locationStrategy: LocationStrategy,
  ) { }

  ngAfterViewInit() {
    tinymce.init({
      target: this.host.nativeElement,
      skin_url: `${this.locationStrategy.getBaseHref()}assets/skins/lightgray`,
      inline: true,
      menubar: false,
      toolbar: false,
      readonly : 1,
      
      setup: editor => {
        this.editor = editor;
        // set content
        editor.on('init', () => {
          editor.setContent(this.rickText ? this.rickText : '<p></p>');
        });
      },
    });
    tinymce.activeEditor.dom.setAttribs(tinymce.activeEditor.dom.select('img'), {'width': 80, 'height': 'auto'});
    // tinymce.activeEditor.dom.setStyle(tinymce.activeEditor.dom.select('table'), {'display':'none'});
  }
  ngOnDestroy() {
    tinymce.remove(this.editor);
  }
}