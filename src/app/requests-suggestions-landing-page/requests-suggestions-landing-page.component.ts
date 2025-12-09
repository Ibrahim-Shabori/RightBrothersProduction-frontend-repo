import { AsyncPipe, CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterModule, // Includes RouterLink & RouterOutlet
} from '@angular/router';
import { filter, map, Observable, startWith, distinctUntilChanged } from 'rxjs';

// PrimeNG
import { MenuModule } from 'primeng/menu';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-requests-suggestions-landing-page',
  standalone: true,
  imports: [CommonModule, RouterModule, AsyncPipe, MenuModule, CardModule],
  templateUrl: './requests-suggestions-landing-page.component.html',
  styleUrl: './requests-suggestions-landing-page.component.css',
})
export class RequestsSuggestionsLandingPageComponent {
  type$!: Observable<'features' | 'bugs' | null>;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.type$ = this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      startWith(null),
      map(() => this.findDeepestActivatedRoute(this.route)),
      map((r) => r?.snapshot?.data?.['type'] ?? null),
      distinctUntilChanged()
    );
  }

  private findDeepestActivatedRoute(
    route: ActivatedRoute
  ): ActivatedRoute | null {
    let r: ActivatedRoute | null = route;
    while (r && r.firstChild) {
      r = r.firstChild;
    }
    return r;
  }
}
