import { ApplicationConfig, provideBrowserGlobalErrorListeners, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { AuthService } from './features/auth/services/auth.service';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Ensure AuthService is instantiated and initialized BEFORE routing
    {
      provide: APP_INITIALIZER,
      useFactory: (authService: AuthService) => () => {
        // Explicitly initialize auth (restore from localStorage) before any routes activate
        authService.initializeAuth();
        console.log('Auth initialized. Token present:', !!authService.getToken());
      },
      deps: [AuthService],
      multi: true
    },
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ]
};
