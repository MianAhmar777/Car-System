"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new client_1.PrismaClient();
async function main() {
    if (process.env.NODE_ENV === 'production') {
        console.log('⚠️ Skipping demo user seed in PRODUCTION mode. Configure administrative accounts via secure deployment scripts.');
        return;
    }
    console.log('🌱 Starting database seed (Development / Testing Mode)...');
    const adminRole = await prisma.role.upsert({
        where: { name: 'ADMIN' },
        update: {},
        create: { name: 'ADMIN', description: 'System Administrator with full access', isSystem: true },
    });
    const staffRole = await prisma.role.upsert({
        where: { name: 'STAFF' },
        update: {},
        create: { name: 'STAFF', description: 'Rental Staff Operations', isSystem: true },
    });
    const customerRole = await prisma.role.upsert({
        where: { name: 'CUSTOMER' },
        update: {},
        create: { name: 'CUSTOMER', description: 'Registered Customer', isSystem: true },
    });
    const permissionsData = [
        { action: 'car:create', description: 'Create vehicle' },
        { action: 'car:update', description: 'Update vehicle' },
        { action: 'car:delete', description: 'Delete vehicle' },
        { action: 'booking:confirm', description: 'Confirm booking' },
        { action: 'contract:approve', description: 'Approve customer contract' },
        { action: 'vehicle:release', description: 'Authorize vehicle release' },
        { action: 'inspection:create', description: 'Perform vehicle inspection' },
    ];
    for (const p of permissionsData) {
        const perm = await prisma.permission.upsert({
            where: { action: p.action },
            update: {},
            create: p,
        });
        await prisma.rolePermission.upsert({
            where: { roleId_permissionId: { roleId: adminRole.id, permissionId: perm.id } },
            update: {},
            create: { roleId: adminRole.id, permissionId: perm.id },
        });
        if (['booking:confirm', 'contract:approve', 'vehicle:release', 'inspection:create'].includes(p.action)) {
            await prisma.rolePermission.upsert({
                where: { roleId_permissionId: { roleId: staffRole.id, permissionId: perm.id } },
                update: {},
                create: { roleId: staffRole.id, permissionId: perm.id },
            });
        }
    }
    const hashedPassword = await bcrypt.hash('AdminPass123!', 10);
    const customerPassword = await bcrypt.hash('CustomerPass123!', 10);
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@carrental.com' },
        update: {},
        create: {
            email: 'admin@carrental.com',
            password: hashedPassword,
            fullName: 'System Administrator',
            phone: '+1-555-0100',
            roleId: adminRole.id,
            isVerified: true,
        },
    });
    const staffUser = await prisma.user.upsert({
        where: { email: 'staff@carrental.com' },
        update: {},
        create: {
            email: 'staff@carrental.com',
            password: hashedPassword,
            fullName: 'Sarah Staff',
            phone: '+1-555-0101',
            roleId: staffRole.id,
            isVerified: true,
        },
    });
    const customerUser = await prisma.user.upsert({
        where: { email: 'john.doe@example.com' },
        update: {},
        create: {
            email: 'john.doe@example.com',
            password: customerPassword,
            fullName: 'John Doe',
            phone: '+1-555-0102',
            cnicPassport: 'CNIC-12345-6789012-3',
            licenseNumber: 'DL-987654321',
            address: '123 Main Street, Suite 4B, New York, NY',
            roleId: customerRole.id,
            isVerified: true,
        },
    });
    console.log(`👤 Users seeded: Admin (${adminUser.email}), Staff (${staffUser.email}), Customer (${customerUser.email})`);
    const categoriesData = [
        { name: 'Economy', description: 'Fuel-efficient compact vehicles for everyday city commute.', sortOrder: 1 },
        { name: 'Sedan', description: 'Comfortable executive sedans suitable for long journeys.', sortOrder: 2 },
        { name: 'SUV', description: 'Spacious all-terrain SUVs with high seating capacity.', sortOrder: 3 },
        { name: 'Luxury', description: 'Premium luxury vehicles offering peak performance and elegance.', sortOrder: 4 },
        { name: 'Van', description: 'High-capacity passenger vans for large family and team trips.', sortOrder: 5 },
    ];
    const categoryMap = {};
    for (const c of categoriesData) {
        const cat = await prisma.carCategory.upsert({
            where: { name: c.name },
            update: {},
            create: c,
        });
        categoryMap[c.name] = cat.id;
    }
    const locationsData = [
        { name: 'JFK Airport Central Hub', address: 'Terminal 4 Car Rental Center', city: 'New York', openingHours: '24/7' },
        { name: 'Downtown Manhattan Center', address: '45 Wall Street Garage', city: 'New York', openingHours: '07:00 AM - 10:00 PM' },
        { name: 'Westside Transit Station', address: '200 10th Ave', city: 'New York', openingHours: '08:00 AM - 08:00 PM' },
    ];
    const locationIds = [];
    for (const l of locationsData) {
        const loc = await prisma.location.upsert({
            where: { name: l.name },
            update: {},
            create: l,
        });
        locationIds.push(loc.id);
    }
    const carsData = [
        {
            registrationNumber: 'NYC-2026-01',
            make: 'Toyota',
            model: 'Corolla',
            year: 2024,
            color: 'Silver',
            category: 'Economy',
            dailyRate: 45,
            weeklyRate: 280,
            monthlyRate: 1000,
            securityDeposit: 200,
            transmission: client_1.TransmissionType.AUTOMATIC,
            fuelType: client_1.FuelType.PETROL,
            seatingCapacity: 5,
            mileage: 12000,
            description: 'Reliable Toyota Corolla sedan with Bluetooth, Lane Assist, and back-up camera.',
            images: ['https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800'],
            features: ['Apple CarPlay', 'Cruise Control', 'Rear Camera', 'Bluetooth'],
        },
        {
            registrationNumber: 'NYC-2026-02',
            make: 'Honda',
            model: 'Civic',
            year: 2024,
            color: 'Midnight Blue',
            category: 'Economy',
            dailyRate: 50,
            weeklyRate: 310,
            monthlyRate: 1100,
            securityDeposit: 200,
            transmission: client_1.TransmissionType.AUTOMATIC,
            fuelType: client_1.FuelType.PETROL,
            seatingCapacity: 5,
            mileage: 8500,
            description: 'Modern Honda Civic with sleek interior design and excellent fuel efficiency.',
            images: ['https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?w=800'],
            features: ['Android Auto', 'Adaptive Cruise', 'Keyless Entry'],
        },
        {
            registrationNumber: 'NYC-2026-03',
            make: 'Toyota',
            model: 'Camry Hybrid',
            year: 2025,
            color: 'Pearl White',
            category: 'Sedan',
            dailyRate: 65,
            weeklyRate: 400,
            monthlyRate: 1450,
            securityDeposit: 250,
            transmission: client_1.TransmissionType.AUTOMATIC,
            fuelType: client_1.FuelType.HYBRID,
            seatingCapacity: 5,
            mileage: 5400,
            description: 'Premium Toyota Camry Hybrid delivering smooth ride quality and high mpg.',
            images: ['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800'],
            features: ['Leather Seats', 'Heated Seats', 'Navigation System', 'Wireless Charging'],
        },
        {
            registrationNumber: 'NYC-2026-04',
            make: 'Tesla',
            model: 'Model Y',
            year: 2025,
            color: 'Solid Black',
            category: 'SUV',
            dailyRate: 95,
            weeklyRate: 600,
            monthlyRate: 2200,
            securityDeposit: 400,
            transmission: client_1.TransmissionType.AUTOMATIC,
            fuelType: client_1.FuelType.ELECTRIC,
            seatingCapacity: 5,
            mileage: 3200,
            description: 'All-electric Tesla Model Y SUV with Autopilot capability and panoramic glass roof.',
            images: ['https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800'],
            features: ['Autopilot', 'Glass Roof', 'Supercharging Enabled', 'Premium Audio'],
        },
        {
            registrationNumber: 'NYC-2026-05',
            make: 'BMW',
            model: '5 Series 530i',
            year: 2024,
            color: 'Dark Grey',
            category: 'Luxury',
            dailyRate: 140,
            weeklyRate: 880,
            monthlyRate: 3200,
            securityDeposit: 600,
            transmission: client_1.TransmissionType.AUTOMATIC,
            fuelType: client_1.FuelType.PETROL,
            seatingCapacity: 5,
            mileage: 9800,
            description: 'Luxury executive sedan with xDrive AWD, Harman Kardon surround system, and ambient light.',
            images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800'],
            features: ['Heated & Ventilated Seats', 'Head-Up Display', '360 Camera', 'Sunroof'],
        },
        {
            registrationNumber: 'NYC-2026-06',
            make: 'Mercedes-Benz',
            model: 'GLE 450',
            year: 2025,
            color: 'Obsidian Black',
            category: 'Luxury',
            dailyRate: 175,
            weeklyRate: 1100,
            monthlyRate: 4000,
            securityDeposit: 750,
            transmission: client_1.TransmissionType.AUTOMATIC,
            fuelType: client_1.FuelType.PETROL,
            seatingCapacity: 7,
            mileage: 4100,
            description: 'Ultra-luxurious 7-seater SUV equipped with MBUX infotainment and air suspension.',
            images: ['https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800'],
            features: ['MBUX Hyperscreen', 'Panoramic Sunroof', 'Air Suspension', 'Massage Seats'],
        },
        {
            registrationNumber: 'NYC-2026-07',
            make: 'Ford',
            model: 'Explorer',
            year: 2024,
            color: 'Agate Black',
            category: 'SUV',
            dailyRate: 85,
            weeklyRate: 530,
            monthlyRate: 1900,
            securityDeposit: 350,
            transmission: client_1.TransmissionType.AUTOMATIC,
            fuelType: client_1.FuelType.PETROL,
            seatingCapacity: 7,
            mileage: 14200,
            description: 'Powerful 7-passenger SUV suitable for road trips with towing package.',
            images: ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800'],
            features: ['7 Seats', '4WD', 'Roof Rails', 'Towing Package'],
        },
        {
            registrationNumber: 'NYC-2026-08',
            make: 'Ford',
            model: 'Transit Pass Van',
            year: 2024,
            color: 'Oxford White',
            category: 'Van',
            dailyRate: 120,
            weeklyRate: 750,
            monthlyRate: 2700,
            securityDeposit: 400,
            transmission: client_1.TransmissionType.AUTOMATIC,
            fuelType: client_1.FuelType.DIESEL,
            seatingCapacity: 12,
            mileage: 18500,
            description: 'Full-size 12-passenger van for group excursions with high ceiling clearance.',
            images: ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800'],
            features: ['12 Passenger Capacity', 'Dual Air Conditioning', 'Rear Parking Sensors'],
        },
    ];
    for (const car of carsData) {
        const { category, images, features, ...cData } = car;
        await prisma.car.upsert({
            where: { registrationNumber: cData.registrationNumber },
            update: {},
            create: {
                ...cData,
                categoryId: categoryMap[category],
                status: client_1.CarStatus.AVAILABLE,
                images: { create: images.map((url, idx) => ({ url, isPrimary: idx === 0 })) },
                features: { create: features.map((name) => ({ name })) },
                locations: { create: locationIds.map((locId) => ({ locationId: locId })) },
            },
        });
    }
    console.log('🚗 Cars fleet seeded successfully.');
    const servicesData = [
        { name: 'GPS Navigation System', description: 'Portable GPS unit with real-time traffic updates.', price: 10, pricingType: 'PER_DAY' },
        { name: 'Child Safety Seat', description: 'Certified infant/child safety seat.', price: 8, pricingType: 'PER_DAY' },
        { name: 'Additional Driver Coverage', description: 'Allows a second registered driver to operate the car.', price: 25, pricingType: 'PER_BOOKING' },
        { name: 'Comprehensive Zero-Deductible Insurance', description: 'Full coverage for collision, theft, and third-party liabilities.', price: 20, pricingType: 'PER_DAY' },
    ];
    for (const s of servicesData) {
        await prisma.additionalService.upsert({
            where: { name: s.name },
            update: {},
            create: s,
        });
    }
    await prisma.discount.upsert({
        where: { code: 'SUMMER15' },
        update: {},
        create: {
            code: 'SUMMER15',
            description: '15% Discount on Summer Rentals',
            percentage: 15,
            validFrom: new Date('2026-01-01'),
            validUntil: new Date('2026-12-31'),
            usageLimit: 100,
        },
    });
    await prisma.discount.upsert({
        where: { code: 'WELCOME10' },
        update: {},
        create: {
            code: 'WELCOME10',
            description: '\$10 Off First Reservation',
            fixedAmount: 10,
            validFrom: new Date('2026-01-01'),
            validUntil: new Date('2026-12-31'),
            usageLimit: 500,
        },
    });
    await prisma.contractTemplate.upsert({
        where: { id: 'default-template-id' },
        update: {},
        create: {
            id: 'default-template-id',
            title: 'Master Vehicle Rental & Liability Agreement 2026',
            bodyText: `1. RENTAL PERIOD & VEHICLE HANDOVER: The Lessor agrees to rent the specified vehicle to Lessee for the selected dates. Lessee agrees to return the vehicle in identical condition at the agreed return location.
2. SECURITY DEPOSIT: The Lessee provides a refundable security deposit to cover potential toll violations, fuel shortages, or minor damage.
3. DIGITAL SIGNATURE IMMUTABILITY: Electronic signatures executed inside this application or verified PDF document uploads represent binding legal consent under standard digital transaction laws.`,
            version: 1,
            isActive: true,
        },
    });
    console.log('✅ Database Seeding Complete!');
}
main()
    .catch((e) => {
    console.error('❌ Error during database seed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map