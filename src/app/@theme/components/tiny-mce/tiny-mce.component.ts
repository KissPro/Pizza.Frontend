import { Component, OnDestroy, AfterViewInit, Output, EventEmitter, ElementRef, Input } from '@angular/core';
import { LocationStrategy } from '@angular/common';

@Component({
  selector: 'ngx-tiny-mce',
  template: ' <input name="image" type="file" id="upload" class="hidden" onchange="">',
})
export class TinyMCEComponent implements OnDestroy, AfterViewInit {

  @Output() editorKeyup = new EventEmitter<any>();
  @Input() rickText: any;
  editor: any;

  constructor(
    private host: ElementRef,
    private locationStrategy: LocationStrategy,
  ) { }

  ngAfterViewInit() {
    tinymce.init({
      target: this.host.nativeElement,
      plugins: ['link', 'paste', 'table'],
      skin_url: `${this.locationStrategy.getBaseHref()}assets/skins/lightgray`,
      setup: editor => {
        this.editor = editor;
        // set content
        editor.on('init', () => {
          editor.setContent(this.rickText);
        });
        // get context
        editor.on('keyup', () => {
          this.editorKeyup.emit(editor.getContent());
        });
      },
      height: '100',
    });
  }

  ngOnDestroy() {
    tinymce.remove(this.editor);
  }
}
