import { Component, OnInit } from '@angular/core';
import { distinctUntilChanged, filter, map, Observable, startWith } from 'rxjs';
import { ActivatedRoute, Data, NavigationEnd, Router } from '@angular/router';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-auth',
  imports: [RouterLink, RouterOutlet, AsyncPipe],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css',
})
export class AuthComponent implements OnInit {
  mode$!: Observable<'login' | 'signup' | null>;
  routerUrl: string = '';

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.routerUrl = this.router.url;
    this.mode$ = this.router.events.pipe(
      // only react on navigation end (but include one initial emission)
      filter((e) => e instanceof NavigationEnd),
      startWith(null), // emit once for the current route on init
      map(() => this.findDeepestActivatedRoute(this.route)),
      map((r) => r?.snapshot?.data?.['mode'] ?? null),
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
