import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma/prisma.module';
import { StorageModule } from './storage/storage.module';
import { AuditModule } from './audit/audit.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { CategoriesModule } from './categories/categories.module';
import { LocationsModule } from './locations/locations.module';
import { CarsModule } from './cars/cars.module';
import { PricingModule } from './pricing/pricing.module';
import { ServicesModule } from './services/services.module';
import { DiscountsModule } from './discounts/discounts.module';
import { DocumentsModule } from './documents/documents.module';
import { BookingsModule } from './bookings/bookings.module';
import { ContractsModule } from './contracts/contracts.module';
import { VehicleReleaseModule } from './vehicle-release/vehicle-release.module';
import { InspectionsModule } from './inspections/inspections.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { PaymentsModule } from './payments/payments.module';
import { InvoicesModule } from './invoices/invoices.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ReportsModule } from './reports/reports.module';
import { SeoModule } from './seo/seo.module';

import { HealthController } from './health.controller';

@Module({
  controllers: [HealthController],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    StorageModule,
    AuditModule,
    NotificationsModule,
    AuthModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    CategoriesModule,
    LocationsModule,
    CarsModule,
    PricingModule,
    ServicesModule,
    DiscountsModule,
    DocumentsModule,
    BookingsModule,
    ContractsModule,
    VehicleReleaseModule,
    InspectionsModule,
    MaintenanceModule,
    PaymentsModule,
    InvoicesModule,
    ReviewsModule,
    ReportsModule,
    SeoModule,
  ],
})
export class AppModule {}
