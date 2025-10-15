import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { distinctUntilChanged, filter, map, Observable, startWith } from 'rxjs';

@Component({
  selector: 'app-requests-suggestions-landing-page',
  imports: [RouterLink, RouterOutlet, AsyncPipe],
  templateUrl: './requests-suggestions-landing-page.component.html',
  styleUrl: './requests-suggestions-landing-page.component.css',
})
export class RequestsSuggestionsLandingPageComponent {
  type$!: Observable<'features' | 'bugs' | null>;
  routerUrl: string = '';

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.routerUrl = this.router.url;
    this.type$ = this.router.events.pipe(
      // only react on navigation end (but include one initial emission)
      filter((e) => e instanceof NavigationEnd),
      startWith(null), // emit once for the current route on init
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
