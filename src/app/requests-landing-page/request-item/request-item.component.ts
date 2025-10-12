import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-request-item',
  imports: [],
  templateUrl: './request-item.component.html',
  styleUrl: './request-item.component.css',
})
export class RequestItemComponent {
  @Input() votesCount?: string;
  @Input() requestTitle?: string;
  @Input() requestType?: 'اقتراح إضافة' | 'إبلاغ عن خطأ';
}
