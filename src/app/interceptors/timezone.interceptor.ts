import { HttpInterceptorFn } from '@angular/common/http';

export const timezoneInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. Get the offset in minutes
  // Note: returns difference from UTC. e.g., for UTC+2, it returns -120.
  const offset = new Date().getTimezoneOffset().toString();

  // 2. Clone the request and append the header
  const modifiedReq = req.clone({
    setHeaders: {
      'X-Timezone-Offset': offset,
    },
  });

  return next(modifiedReq);
};
