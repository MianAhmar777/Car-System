import { RolesGuard } from '../src/common/guards/roles.guard';
import { PermissionsGuard } from '../src/common/guards/permissions.guard';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

describe('RBAC & Security Boundaries (Unit/Integration)', () => {
  let rolesGuard: RolesGuard;
  let permissionsGuard: PermissionsGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    rolesGuard = new RolesGuard(reflector);
    permissionsGuard = new PermissionsGuard(reflector);
  });

  const createMockContext = (user: any): ExecutionContext => {
    return {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as any;
  };

  it('1. RolesGuard DENIES Customer from accessing ADMIN endpoints', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);

    const customerUser = { id: 'cust-1', roleName: 'CUSTOMER' };
    const context = createMockContext(customerUser);

    expect(() => rolesGuard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('2. RolesGuard ALLOWS Admin to access ADMIN endpoints', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);

    const adminUser = { id: 'admin-1', roleName: 'ADMIN' };
    const context = createMockContext(adminUser);

    expect(rolesGuard.canActivate(context)).toBe(true);
  });

  it('3. PermissionsGuard DENIES user missing required action permission', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['vehicle:release']);

    const staffUserMissingPerm = { id: 'staff-1', roleName: 'STAFF', permissions: ['booking:confirm'] };
    const context = createMockContext(staffUserMissingPerm);

    expect(() => permissionsGuard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('4. PermissionsGuard ALLOWS user possessing required action permission', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['vehicle:release']);

    const staffUserWithPerm = { id: 'staff-1', roleName: 'STAFF', permissions: ['vehicle:release'] };
    const context = createMockContext(staffUserWithPerm);

    expect(permissionsGuard.canActivate(context)).toBe(true);
  });
});
