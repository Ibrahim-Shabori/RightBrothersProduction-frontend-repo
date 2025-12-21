import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequestCardComponent } from '../../request-card/request-card.component';
import { RouterLink } from '@angular/router';
import {
  RequestResponseDto,
  RequestStatus,
  RequestType,
} from '../../shared/models/request.model';

// PrimeNG Imports
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-profile-watchlist',
  standalone: true,
  imports: [CommonModule, RequestCardComponent, ButtonModule, RouterLink],
  templateUrl: './profile-watchlist.component.html',
  styleUrls: ['./profile-watchlist.component.css'],
})
export class ProfileWatchlistComponent implements OnInit {
  votedRequests = signal<RequestResponseDto[]>([]);
  isLoading = signal<boolean>(true);

  ngOnInit() {
    // Simulate API Fetch
    setTimeout(() => {
      this.loadDummyData();
      this.isLoading.set(false);
    }, 600);
  }

  loadDummyData() {
    this.votedRequests.set([
      {
        id: 205,
        title: 'تحسين سرعة تحميل الصور',
        description:
          'الصور تستغرق وقتاً طويلاً للظهور في الصفحة الرئيسية، مما يؤثر على تجربة المستخدم.',
        status: RequestStatus.InProgress,
        createdAt: new Date('2024-06-10'),
        votesCount: 85,
        type: RequestType.Bug,
        categoryId: 4,
        categoryName: 'الأداء',
        createdByName: 'سارة علي', // ✅ Different user (since we are just watching/voting)
        isDetailed: false,
      },
      {
        id: 209,
        title: 'نظام إشعارات للموافقة على الطلبات',
        description:
          'إرسال بريد إلكتروني تلقائي عند تغيير حالة الطلب من قيد المراجعة إلى قيد العمل.',
        status: RequestStatus.UnderReview,
        createdAt: new Date('2024-06-12'),
        votesCount: 15,
        type: RequestType.Regular,
        categoryId: 3,
        categoryName: 'المميزات الجديدة',
        createdByName: 'محمود حسن',
        isDetailed: true,
      },
      {
        id: 215,
        title: 'إصلاح مشكلة تسجيل الدخول عبر جوجل',
        description: 'تم حل المشكلة وتحديث المكتبات المسؤولة عن المصادقة.',
        status: RequestStatus.Done, // ✅ Using 'Done'
        createdAt: new Date('2024-05-01'),
        votesCount: 340,
        type: RequestType.Bug,
        categoryId: 2,
        categoryName: 'الأخطاء البرمجية',
        createdByName: 'خالد عمر',
        isDetailed: false,
      },
    ]);
  }
}
