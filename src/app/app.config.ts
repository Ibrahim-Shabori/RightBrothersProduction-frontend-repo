import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { PRIMENG_ARABIC } from '../../primeng-arabic';
import { definePreset } from '@primeuix/themes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async'; // 👈 Import this// 1. Define your custom preset
import { authInterceptor } from './interceptors/auth.interceptor';
import { timezoneInterceptor } from './interceptors/timezone.interceptor';
const MyPreset = definePreset(Aura, {
  components: {
    timeline: {
      vertical: {
        eventContent: {
          padding: '0.4rem',
        },
      },
    },
    menubar: {
      root: {
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        borderRadius: '1rem',
      },
      baseItem: {
        padding: '0.5rem 0.2rem',
      },
      item: {
        padding: '0.5rem 1rem',
      },
    },
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, timezoneInterceptor])),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: MyPreset,
        options: {
          darkModeSelector: false || 'none',
        },
      },
      ripple: true,
      translation: PRIMENG_ARABIC,
    }),
  ],
};
