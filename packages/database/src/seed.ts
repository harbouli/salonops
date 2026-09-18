import { db, organizations, branches, users, services, clients, hairFormulas, queryClient } from './index';

async function main() {
  console.log('[Drizzle Seed] Seeding Moroccan Salon database...');

  // 1. Organization
  const [org] = await db
    .insert(organizations)
    .values({
      name: 'Salon Fatima Group',
    })
    .returning();

  // 2. Branch
  const [branch] = await db
    .insert(branches)
    .values({
      organizationId: org.id,
      name: 'Salon Fatima Béni Mellal',
      city: 'Béni Mellal',
      address: 'Boulevard Mohammed V, Béni Mellal',
      phone: '+212 523 48 00 00',
    })
    .returning();

  console.log(`[Drizzle Seed] Created Organization: ${org.name}, Branch: ${branch.name}`);

  // 3. Stylists / Users
  const [owner] = await db
    .insert(users)
    .values({
      branchId: branch.id,
      fullName: 'Fatima Zahra',
      phone: '0661000001',
      passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$dummyhashforowner',
      role: 'OWNER',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      commissionPct: 20.0,
      workingStart: '09:00',
      workingEnd: '19:30',
    })
    .returning();

  const [salma] = await db
    .insert(users)
    .values({
      branchId: branch.id,
      fullName: 'Salma El Amrani',
      phone: '0661000002',
      passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$dummyhashforstylist',
      role: 'STYLIST',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
      commissionPct: 15.0,
      workingStart: '10:00',
      workingEnd: '20:00',
    })
    .returning();

  const [youssef] = await db
    .insert(users)
    .values({
      branchId: branch.id,
      fullName: 'Youssef Mansouri',
      phone: '0661000003',
      passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$dummyhashforstylist',
      role: 'STYLIST',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      commissionPct: 15.0,
      isDayOff: true,
      workingStart: '09:00',
      workingEnd: '19:00',
    })
    .returning();

  console.log(`[Drizzle Seed] Created Stylists: Fatima (Owner), Salma, Youssef (Day Off)`);

  // 4. Services in MAD
  const insertedServices = await db
    .insert(services)
    .values([
      {
        branchId: branch.id,
        nameFr: 'Coupe Femme + Brushing',
        nameAr: 'قص الشعر وسيشوار',
        category: 'coupe',
        durationMinutes: 45,
        bufferMinutes: 10,
        priceMad: '150.00',
      },
      {
        branchId: branch.id,
        nameFr: 'Coloration Racine + Brushing',
        nameAr: 'صباغة الجذور وسيشوار',
        category: 'coloration',
        durationMinutes: 105,
        bufferMinutes: 15,
        priceMad: '350.00',
        depositRequired: true,
      },
      {
        branchId: branch.id,
        nameFr: 'Lissage Protéine / Caviar',
        nameAr: 'ترطيب الشعر بالبروتين',
        category: 'lissage',
        durationMinutes: 180,
        bufferMinutes: 20,
        priceMad: '900.00',
        depositRequired: true,
      },
      {
        branchId: branch.id,
        nameFr: 'Brushing Simple',
        nameAr: 'سيشوار عادي',
        category: 'brushing',
        durationMinutes: 30,
        bufferMinutes: 5,
        priceMad: '80.00',
      },
    ])
    .returning();

  console.log(`[Drizzle Seed] Inserted ${insertedServices.length} services with MAD pricing.`);

  // 5. Client & Hair Formula
  const [client] = await db
    .insert(clients)
    .values({
      branchId: branch.id,
      fullName: 'Meryem Bennani',
      phone: '0661234567',
      loyaltyPoints: 120,
      preferences: ['Thé à la menthe sans sucre', 'Préfère le silence / pas de bavardage'],
      scalpAlert: 'Cuir chevelu sensible - éviter décolorant direct en racine',
    })
    .returning();

  await db.insert(hairFormulas).values({
    clientId: client.id,
    stylistId: owner.id,
    brand: "L'Oréal Majirel",
    shadeFormula: '35g 7.1 + 15g 7.11 (Cendré intense)',
    developerVolume: '20 Vol (6%)',
    processingTimeMinutes: 35,
    beforePhotoUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300',
    afterPhotoUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=300',
    notes: 'Résultat parfait, reflets cuivrés entièrement neutralisés.',
  });

  console.log(`[Drizzle Seed] Created Client ${client.fullName} with digital hair formula.`);
  console.log('[Drizzle Seed] Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('[Drizzle Seed Error]', e);
    process.exit(1);
  })
  .finally(async () => {
    await queryClient.end();
  });
