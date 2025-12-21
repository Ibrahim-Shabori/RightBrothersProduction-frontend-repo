import { AuthService } from './services/auth.service';
import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [RouterOutlet],
})
export class AppComponent {
  constructor(private router: Router, private auth: AuthService) {}

  ngOnInit() {
    this.auth.init();
  }
}
