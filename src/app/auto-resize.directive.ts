import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appAutoResize]',
})
export class AutoResizeDirective {
  constructor(private el: ElementRef<HTMLTextAreaElement>) {}

  @HostListener('input')
  onInput() {
    const textarea = this.el.nativeElement;
    textarea.style.height = 'auto'; // reset first
    textarea.style.height = textarea.scrollHeight + 'px'; // then fit content
  }

  ngAfterViewInit() {
    // adjust height initially if textarea has default text
    this.onInput();
  }
}
