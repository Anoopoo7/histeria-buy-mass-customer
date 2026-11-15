import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { customerAuthGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('customerAuthGuard', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    routerSpy = jasmine.createSpyObj('Router', ['createUrlTree']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });
  });

  it('should allow navigation if customer is authenticated', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);

    const result = TestBed.runInInjectionContext(() =>
      customerAuthGuard(null as any, null as any),
    );

    expect(result).toBeTrue();
  });

  it('should redirect unauthenticated users to /auth/login', () => {
    authServiceSpy.isAuthenticated.and.returnValue(false);
    const mockTree = {} as UrlTree;
    routerSpy.createUrlTree.and.returnValue(mockTree);

    const result = TestBed.runInInjectionContext(() =>
      customerAuthGuard(null as any, null as any),
    );

    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/auth/login']);
    expect(result).toBe(mockTree);
  });
});
