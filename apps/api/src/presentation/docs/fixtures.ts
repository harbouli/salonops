/**
 * Moroccan Salon Domain OpenAPI Fixtures & Examples
 * Encapsulates domain invariants for API contract testing & interactive playground:
 * - Moroccan Dirham (MAD) zero-float & formatted currency
 * - Moroccan carrier phone normalization (+212 6... / +212 7... / 06... / 07...)
 * - Chemical buffer windows for post-service ventilation/sanitization
 * - Split checkout caisse ledger (Cash + TPE Card + Tip)
 * - Bilingual error payloads (French & Moroccan Darija)
 */

export const MOROCCAN_PHONE_REGEX = /^(\+212|0)[67]\d{8}$/;

export const moroccanFixtures = {
  phone: {
    validInternational: '+212661234567',
    validLocal: '0661234567',
    description: 'Numéro de téléphone marocain normalisé (+212 6/7 XX XX XX XX ou 06/07 XX XX XX XX)',
  },

  user: {
    owner: {
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      phone: '+212661234567',
      name: 'Fatima Zahra',
      role: 'OWNER',
      branchId: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
      active: true,
      createdAt: '2026-01-15T09:00:00.000Z',
    },
    stylist: {
      id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
      phone: '+212662345678',
      name: 'Salma El Amrani',
      role: 'STYLIST',
      branchId: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
      active: true,
      createdAt: '2026-02-01T10:30:00.000Z',
    },
  },

  stylist: {
    profile: {
      id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
      name: 'Salma El Amrani',
      phone: '+212662345678',
      role: 'STYLIST',
      active: true,
      specialties: ['Coloration Expert', 'Balayage Oriental', 'Lissage Protéine'],
      workingHours: {
        start: '09:00',
        end: '19:00',
        daysOff: [0], // Dimanche (Sunday off)
      },
      commissionPercentage: 15.0,
    },
  },

  service: {
    lissage: {
      id: 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
      name: 'Lissage Brésilien Protéine',
      description: 'Soin lissant profond aux huiles d’argan et protéine de soie avec aération obligatoire.',
      category: 'LISSAGE',
      priceMad: 600.0,
      durationMinutes: 120,
      bufferMinutes: 20, // Post-service ventilation & cleaning buffer
    },
    balayage: {
      id: 'd4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
      name: 'Balayage Miel & Décoloration',
      description: 'Balayage sur mesure avec patine neutralisante et soin protecteur.',
      category: 'COLORATION',
      priceMad: 450.0,
      durationMinutes: 90,
      bufferMinutes: 15,
    },
  },

  appointment: {
    booked: {
      id: 'e5eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
      branchId: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
      stylistId: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
      clientId: 'f6eebc99-9c0b-4ef8-bb6d-6bb9bd380a77',
      serviceId: 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
      startTime: '2026-09-25T10:00:00.000Z',
      endTime: '2026-09-25T12:00:00.000Z',
      bufferEndTime: '2026-09-25T12:20:00.000Z', // 20m chemical buffer included
      status: 'CONFIRMED',
      notes: 'Cliente sensible au cuir chevelu. Utiliser oxydant 20 volume maximum.',
      createdAt: '2026-09-22T08:30:00.000Z',
    },
    createInput: {
      branchId: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
      stylistId: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
      clientId: 'f6eebc99-9c0b-4ef8-bb6d-6bb9bd380a77',
      serviceId: 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
      startTime: '2026-09-25T10:00:00.000Z',
      notes: 'Demande spécifique coiffeuse Salma.',
    },
    updateStatusInput: {
      status: 'IN_CHAIR',
      reason: 'Cliente arrivée en salon à l’heure.',
    },
  },

  client: {
    profile: {
      id: 'f6eebc99-9c0b-4ef8-bb6d-6bb9bd380a77',
      name: 'Meryem Bennani',
      phone: '+212663456789',
      email: 'meryem.bennani@gmail.com',
      notes: 'Fidèle depuis 2 ans. Préfère thé à la menthe sans sucre.',
      createdAt: '2025-05-10T14:00:00.000Z',
    },
  },

  hairFormula: {
    vaultEntry: {
      id: 'g7eebc99-9c0b-4ef8-bb6d-6bb9bd380a88',
      clientId: 'f6eebc99-9c0b-4ef8-bb6d-6bb9bd380a77',
      stylistId: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
      appointmentId: 'e5eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
      brand: 'L’Oréal Professionnel Majirel',
      shadeFormula: '30g 7.11 + 15g 8.1 + 45g Oxydant 20V (1:1.5)',
      developerVolume: '20 Vol (6%)',
      processingTimeMinutes: 35,
      beforePhotoUrl: 'https://storage.salonops.ma/formulas/before_meryem_20260925.jpg',
      afterPhotoUrl: 'https://storage.salonops.ma/formulas/after_meryem_20260925.jpg',
      scalpAlert: 'Cuir chevelu légèrement réactif - Sérum apaisant appliqué post-rincage.',
      notes: 'Temps de pause respecté à la minute près. Brillance optimale.',
      createdAt: '2026-09-25T11:45:00.000Z',
    },
  },

  checkout: {
    splitRequest: {
      branchId: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
      stylistId: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
      appointmentId: 'e5eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
      clientId: 'f6eebc99-9c0b-4ef8-bb6d-6bb9bd380a77',
      serviceTotalMad: 600.0,
      retailTotalMad: 150.0,
      tipAmountMad: 50.0,
      paymentMethod: 'SPLIT',
      cashAmountMad: 400.0,
      cardAmountMad: 350.0,
    },
    splitResult: {
      id: 'h8eebc99-9c0b-4ef8-bb6d-6bb9bd380a99',
      appointmentId: 'e5eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
      branchId: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
      stylistId: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
      clientId: 'f6eebc99-9c0b-4ef8-bb6d-6bb9bd380a77',
      serviceTotalMad: 600.0,
      retailTotalMad: 150.0,
      tipAmountMad: 50.0,
      paymentMethod: 'SPLIT',
      cashAmountMad: 400.0,
      cardAmountMad: 350.0,
      totalPaidMad: 800.0,
      stylistCommissionMad: 90.0, // 15% on 600 MAD service total
      createdAt: '2026-09-25T12:15:00.000Z',
    },
  },

  errors: {
    slotCollision: {
      error: 'Créneau indisponible en raison du temps de pause chimique ou d’une réservation existante.',
      message_darija: 'Krenou m3amar 3and l-coiffeuse f had l-wqt aw wqt l-lissage.',
      code: 'SLOT_COLLISION',
      statusCode: 409,
    },
    unauthorized: {
      error: 'Authentification requise. Jeton JWT manquant ou invalide.',
      message_darija: 'Khassak t-connecta (Token JWT nakes aw machi sahih).',
      statusCode: 401,
    },
    notFound: {
      error: 'Ressource introuvable.',
      message_darija: 'L-3onsor li kat-kleb 3lih ma kaynch.',
      statusCode: 404,
    },
  },
};
