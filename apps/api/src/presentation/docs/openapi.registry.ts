import {
  OpenAPIRegistry,
  OpenApiGeneratorV31,
  extendZodWithOpenApi,
} from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import { moroccanFixtures, MOROCCAN_PHONE_REGEX } from './fixtures';

// Extend Zod with OpenAPI capabilities
extendZodWithOpenApi(z);

export function buildOpenApiDocument() {
  const registry = new OpenAPIRegistry();

  // 1. Register Security Schemes
  registry.registerComponent('securitySchemes', 'bearerAuth', {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    description: 'Jeton JWT Bearer obtenu via `POST /api/v1/auth/login`',
  });

  // 2. Register Common Zod Schemas
  const UserSchema = registry.register(
    'User',
    z.object({
      id: z.string().uuid().openapi({ example: moroccanFixtures.user.owner.id }),
      phone: z.string().regex(MOROCCAN_PHONE_REGEX).openapi({ example: moroccanFixtures.user.owner.phone }),
      name: z.string().openapi({ example: moroccanFixtures.user.owner.name }),
      role: z.enum(['OWNER', 'MANAGER', 'STYLIST', 'RECEPTIONIST']).openapi({ example: 'OWNER' }),
      branchId: z.string().uuid().openapi({ example: moroccanFixtures.user.owner.branchId }),
      active: z.boolean().openapi({ example: true }),
      createdAt: z.string().datetime().openapi({ example: moroccanFixtures.user.owner.createdAt }),
    })
  );

  const StylistSchema = registry.register(
    'Stylist',
    z.object({
      id: z.string().uuid().openapi({ example: moroccanFixtures.stylist.profile.id }),
      name: z.string().openapi({ example: moroccanFixtures.stylist.profile.name }),
      phone: z.string().regex(MOROCCAN_PHONE_REGEX).openapi({ example: moroccanFixtures.stylist.profile.phone }),
      role: z.string().openapi({ example: 'STYLIST' }),
      active: z.boolean().openapi({ example: true }),
      specialties: z.array(z.string()).openapi({ example: moroccanFixtures.stylist.profile.specialties }),
      workingHours: z.object({
        start: z.string().openapi({ example: '09:00' }),
        end: z.string().openapi({ example: '19:00' }),
        daysOff: z.array(z.number()).openapi({ example: [0] }),
      }),
      commissionPercentage: z.number().openapi({ example: 15.0 }),
    })
  );

  const ServiceSchema = registry.register(
    'Service',
    z.object({
      id: z.string().uuid().openapi({ example: moroccanFixtures.service.lissage.id }),
      name: z.string().openapi({ example: moroccanFixtures.service.lissage.name }),
      description: z.string().optional().openapi({ example: moroccanFixtures.service.lissage.description }),
      category: z.string().openapi({ example: moroccanFixtures.service.lissage.category }),
      priceMad: z.number().openapi({ example: moroccanFixtures.service.lissage.priceMad, description: 'Prix en Dirhams Marocains (MAD)' }),
      durationMinutes: z.number().int().openapi({ example: moroccanFixtures.service.lissage.durationMinutes }),
      bufferMinutes: z.number().int().openapi({ example: moroccanFixtures.service.lissage.bufferMinutes, description: 'Temps de pose / ventilation du poste de travail' }),
    })
  );

  const AppointmentSchema = registry.register(
    'Appointment',
    z.object({
      id: z.string().uuid().openapi({ example: moroccanFixtures.appointment.booked.id }),
      branchId: z.string().uuid().openapi({ example: moroccanFixtures.appointment.booked.branchId }),
      stylistId: z.string().uuid().openapi({ example: moroccanFixtures.appointment.booked.stylistId }),
      clientId: z.string().uuid().openapi({ example: moroccanFixtures.appointment.booked.clientId }),
      serviceId: z.string().uuid().openapi({ example: moroccanFixtures.appointment.booked.serviceId }),
      startTime: z.string().datetime().openapi({ example: moroccanFixtures.appointment.booked.startTime }),
      endTime: z.string().datetime().openapi({ example: moroccanFixtures.appointment.booked.endTime }),
      bufferEndTime: z.string().datetime().openapi({ example: moroccanFixtures.appointment.booked.bufferEndTime, description: 'Fin exacte incluant la plage tampon de ventilation' }),
      status: z.enum(['BOOKED', 'CONFIRMED', 'IN_CHAIR', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).openapi({ example: 'CONFIRMED' }),
      notes: z.string().optional().openapi({ example: moroccanFixtures.appointment.booked.notes }),
      createdAt: z.string().datetime().openapi({ example: moroccanFixtures.appointment.booked.createdAt }),
    })
  );

  const ClientSchema = registry.register(
    'Client',
    z.object({
      id: z.string().uuid().openapi({ example: moroccanFixtures.client.profile.id }),
      name: z.string().openapi({ example: moroccanFixtures.client.profile.name }),
      phone: z.string().regex(MOROCCAN_PHONE_REGEX).openapi({ example: moroccanFixtures.client.profile.phone }),
      email: z.string().email().optional().openapi({ example: moroccanFixtures.client.profile.email }),
      notes: z.string().optional().openapi({ example: moroccanFixtures.client.profile.notes }),
      createdAt: z.string().datetime().openapi({ example: moroccanFixtures.client.profile.createdAt }),
    })
  );

  const HairFormulaSchema = registry.register(
    'HairFormula',
    z.object({
      id: z.string().uuid().openapi({ example: moroccanFixtures.hairFormula.vaultEntry.id }),
      clientId: z.string().uuid().openapi({ example: moroccanFixtures.hairFormula.vaultEntry.clientId }),
      stylistId: z.string().uuid().openapi({ example: moroccanFixtures.hairFormula.vaultEntry.stylistId }),
      appointmentId: z.string().uuid().optional().openapi({ example: moroccanFixtures.hairFormula.vaultEntry.appointmentId }),
      brand: z.string().openapi({ example: moroccanFixtures.hairFormula.vaultEntry.brand }),
      shadeFormula: z.string().openapi({ example: moroccanFixtures.hairFormula.vaultEntry.shadeFormula }),
      developerVolume: z.string().openapi({ example: moroccanFixtures.hairFormula.vaultEntry.developerVolume }),
      processingTimeMinutes: z.number().int().openapi({ example: moroccanFixtures.hairFormula.vaultEntry.processingTimeMinutes }),
      beforePhotoUrl: z.string().url().optional().openapi({ example: moroccanFixtures.hairFormula.vaultEntry.beforePhotoUrl }),
      afterPhotoUrl: z.string().url().optional().openapi({ example: moroccanFixtures.hairFormula.vaultEntry.afterPhotoUrl }),
      scalpAlert: z.string().optional().openapi({ example: moroccanFixtures.hairFormula.vaultEntry.scalpAlert }),
      notes: z.string().optional().openapi({ example: moroccanFixtures.hairFormula.vaultEntry.notes }),
      createdAt: z.string().datetime().openapi({ example: moroccanFixtures.hairFormula.vaultEntry.createdAt }),
    })
  );

  const TransactionSchema = registry.register(
    'Transaction',
    z.object({
      id: z.string().uuid().openapi({ example: moroccanFixtures.checkout.splitResult.id }),
      appointmentId: z.string().uuid().optional().openapi({ example: moroccanFixtures.checkout.splitResult.appointmentId }),
      branchId: z.string().uuid().openapi({ example: moroccanFixtures.checkout.splitResult.branchId }),
      stylistId: z.string().uuid().openapi({ example: moroccanFixtures.checkout.splitResult.stylistId }),
      clientId: z.string().uuid().optional().openapi({ example: moroccanFixtures.checkout.splitResult.clientId }),
      serviceTotalMad: z.number().openapi({ example: moroccanFixtures.checkout.splitResult.serviceTotalMad, description: 'Total prestation en MAD' }),
      retailTotalMad: z.number().openapi({ example: moroccanFixtures.checkout.splitResult.retailTotalMad, description: 'Total vente produits en MAD' }),
      tipAmountMad: z.number().openapi({ example: moroccanFixtures.checkout.splitResult.tipAmountMad, description: 'Pourboire coiffeuse en MAD' }),
      paymentMethod: z.enum(['CASH', 'TPE_CARD', 'SPLIT']).openapi({ example: 'SPLIT' }),
      cashAmountMad: z.number().openapi({ example: moroccanFixtures.checkout.splitResult.cashAmountMad }),
      cardAmountMad: z.number().openapi({ example: moroccanFixtures.checkout.splitResult.cardAmountMad }),
      totalPaidMad: z.number().openapi({ example: moroccanFixtures.checkout.splitResult.totalPaidMad }),
      stylistCommissionMad: z.number().openapi({ example: moroccanFixtures.checkout.splitResult.stylistCommissionMad, description: 'Commission calculée (%) pour la coiffeuse' }),
      createdAt: z.string().datetime().openapi({ example: moroccanFixtures.checkout.splitResult.createdAt }),
    })
  );

  const StylistCaisseBreakdownSchema = registry.register(
    'StylistCaisseBreakdown',
    z.object({
      stylistId: z.string().uuid(),
      serviceRevenueMad: z.string().openapi({ example: '600.00' }),
      commissionMad: z.string().openapi({ example: '90.00' }),
      tipsMad: z.string().openapi({ example: '50.00' }),
      transactionCount: z.number().int().openapi({ example: 3 }),
    })
  );

  const CaisseReconciliationSchema = registry.register(
    'CaisseReconciliation',
    z.object({
      branchId: z.string().uuid(),
      date: z.string().openapi({ example: '2026-09-24' }),
      openingCashMad: z.string().openapi({ example: '500.00' }),
      totalCashMad: z.string().openapi({ example: '2450.00' }),
      totalCardMad: z.string().openapi({ example: '1800.00' }),
      totalPaidMad: z.string().openapi({ example: '4250.00' }),
      totalServiceRevenueMad: z.string().openapi({ example: '3800.00' }),
      totalRetailRevenueMad: z.string().openapi({ example: '450.00' }),
      totalGrossRevenueMad: z.string().openapi({ example: '4250.00' }),
      totalTipsMad: z.string().openapi({ example: '320.00' }),
      totalCommissionsMad: z.string().openapi({ example: '570.00' }),
      netSalonRevenueMad: z.string().openapi({ example: '3680.00' }),
      transactionCount: z.number().int().openapi({ example: 12 }),
      expectedDrawerCashMad: z.string().openapi({ example: '2950.00' }),
      actualCashMad: z.string().nullable().optional().openapi({ example: '2950.00' }),
      varianceMad: z.string().nullable().optional().openapi({ example: '0.00' }),
      isBalanced: z.boolean().openapi({ example: true }),
      stylistBreakdowns: z.array(StylistCaisseBreakdownSchema),
    })
  );

  const ErrorResponseSchema = registry.register(
    'ErrorResponse',
    z.object({
      error: z.string().openapi({ example: moroccanFixtures.errors.slotCollision.error }),
    })
  );

  const BilingualErrorResponseSchema = registry.register(
    'BilingualErrorResponse',
    z.object({
      error: z.string().openapi({ example: moroccanFixtures.errors.slotCollision.error }),
      message_darija: z.string().openapi({ example: moroccanFixtures.errors.slotCollision.message_darija }),
      code: z.string().optional().openapi({ example: 'SLOT_COLLISION' }),
    })
  );

  // Input Schemas
  const LoginRequestSchema = registry.register(
    'LoginRequest',
    z.object({
      phone: z.string().openapi({ example: moroccanFixtures.user.owner.phone, description: 'Numéro Marocain (+212 6/7 XX XX XX XX)' }),
      password: z.string().min(1).openapi({ example: 'Password123!', description: 'Mot de passe utilisateur' }),
    })
  );

  const CreateAppointmentRequestSchema = registry.register(
    'CreateAppointmentRequest',
    z.object({
      branchId: z.string().uuid().openapi({ example: moroccanFixtures.appointment.createInput.branchId }),
      stylistId: z.string().uuid().openapi({ example: moroccanFixtures.appointment.createInput.stylistId }),
      clientId: z.string().uuid().openapi({ example: moroccanFixtures.appointment.createInput.clientId }),
      serviceId: z.string().uuid().openapi({ example: moroccanFixtures.appointment.createInput.serviceId }),
      startTime: z.string().datetime().openapi({ example: moroccanFixtures.appointment.createInput.startTime }),
      notes: z.string().optional().openapi({ example: moroccanFixtures.appointment.createInput.notes }),
    })
  );

  const UpdateAppointmentStatusRequestSchema = registry.register(
    'UpdateAppointmentStatusRequest',
    z.object({
      status: z.enum(['BOOKED', 'CONFIRMED', 'IN_CHAIR', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).openapi({ example: 'IN_CHAIR' }),
      reason: z.string().optional().openapi({ example: moroccanFixtures.appointment.updateStatusInput.reason }),
    })
  );

  const CreateHairFormulaRequestSchema = registry.register(
    'CreateHairFormulaRequest',
    z.object({
      clientId: z.string().uuid().openapi({ example: moroccanFixtures.hairFormula.vaultEntry.clientId }),
      stylistId: z.string().uuid().openapi({ example: moroccanFixtures.hairFormula.vaultEntry.stylistId }),
      appointmentId: z.string().uuid().optional().openapi({ example: moroccanFixtures.hairFormula.vaultEntry.appointmentId }),
      brand: z.string().min(1).openapi({ example: moroccanFixtures.hairFormula.vaultEntry.brand }),
      shadeFormula: z.string().min(1).openapi({ example: moroccanFixtures.hairFormula.vaultEntry.shadeFormula }),
      developerVolume: z.string().min(1).openapi({ example: moroccanFixtures.hairFormula.vaultEntry.developerVolume }),
      processingTimeMinutes: z.number().int().positive().openapi({ example: moroccanFixtures.hairFormula.vaultEntry.processingTimeMinutes }),
      beforePhotoUrl: z.string().url().optional().openapi({ example: moroccanFixtures.hairFormula.vaultEntry.beforePhotoUrl }),
      afterPhotoUrl: z.string().url().optional().openapi({ example: moroccanFixtures.hairFormula.vaultEntry.afterPhotoUrl }),
      scalpAlert: z.string().optional().openapi({ example: moroccanFixtures.hairFormula.vaultEntry.scalpAlert }),
      notes: z.string().optional().openapi({ example: moroccanFixtures.hairFormula.vaultEntry.notes }),
    })
  );

  const ProcessCheckoutRequestSchema = registry.register(
    'ProcessCheckoutRequest',
    z.object({
      branchId: z.string().uuid().openapi({ example: moroccanFixtures.checkout.splitRequest.branchId }),
      stylistId: z.string().uuid().openapi({ example: moroccanFixtures.checkout.splitRequest.stylistId }),
      appointmentId: z.string().uuid().optional().openapi({ example: moroccanFixtures.checkout.splitRequest.appointmentId }),
      clientId: z.string().uuid().optional().openapi({ example: moroccanFixtures.checkout.splitRequest.clientId }),
      serviceTotalMad: z.union([z.number(), z.string()]).openapi({ example: 600.0, description: 'Montant prestations en MAD' }),
      retailTotalMad: z.union([z.number(), z.string()]).optional().openapi({ example: 150.0 }),
      tipAmountMad: z.union([z.number(), z.string()]).optional().openapi({ example: 50.0, description: 'Pourboire coiffeuse en MAD' }),
      paymentMethod: z.enum(['CASH', 'TPE_CARD', 'SPLIT']).openapi({ example: 'SPLIT' }),
      cashAmountMad: z.union([z.number(), z.string()]).optional().openapi({ example: 400.0 }),
      cardAmountMad: z.union([z.number(), z.string()]).optional().openapi({ example: 350.0 }),
    })
  );

  // 3. Register API Operations (Paths)

  // Health
  registry.registerPath({
    method: 'get',
    path: '/health',
    summary: 'Vérification de l’état du serveur (Health Check)',
    description: 'Retourne un statut HTTP 200 avec timestamp pour le monitoring de l’infrastructure.',
    tags: ['Health'],
    responses: {
      200: {
        description: 'Serveur opérationnel',
        content: {
          'application/json': {
            schema: z.object({
              status: z.string().openapi({ example: 'ok' }),
              timestamp: z.string().openapi({ example: '2026-09-22T12:00:00.000Z' }),
            }),
          },
        },
      },
    },
  });

  // Auth: POST /api/v1/auth/login
  registry.registerPath({
    method: 'post',
    path: '/api/v1/auth/login',
    summary: 'Connexion Utilisateur & Génération Jeton JWT',
    description: 'Authentifie un gérant, réceptionniste ou coiffeuse via son numéro marocain (+212) et mot de passe.',
    tags: ['Authentication'],
    request: {
      body: {
        content: {
          'application/json': {
            schema: LoginRequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Authentification réussie',
        content: {
          'application/json': {
            schema: z.object({
              token: z.string().openapi({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }),
              user: UserSchema,
            }),
          },
        },
      },
      401: {
        description: 'Identifiants invalides',
        content: {
          'application/json': {
            schema: BilingualErrorResponseSchema,
          },
        },
      },
    },
  });

  // Auth: GET /api/v1/auth/me
  registry.registerPath({
    method: 'get',
    path: '/api/v1/auth/me',
    summary: 'Profil Utilisateur Connecté',
    description: 'Récupère les informations et le rôle de l’utilisateur authentifié via son jeton Bearer JWT.',
    tags: ['Authentication'],
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: 'Profil récupéré',
        content: {
          'application/json': {
            schema: z.object({
              user: UserSchema,
            }),
          },
        },
      },
      401: {
        description: 'Authentification requise',
        content: {
          'application/json': {
            schema: ErrorResponseSchema,
          },
        },
      },
    },
  });

  // Stylists: GET /api/v1/stylists
  registry.registerPath({
    method: 'get',
    path: '/api/v1/stylists',
    summary: 'Liste des Coiffeuses & Artistes',
    description: 'Récupère la liste des coiffeuses actives avec leurs spécialités et horaires de travail.',
    tags: ['Stylists'],
    request: {
      query: z.object({
        branchId: z.string().uuid().optional().openapi({ description: 'Filtrer par identifiant de salon/succursale' }),
      }),
    },
    responses: {
      200: {
        description: 'Liste des coiffeuses',
        content: {
          'application/json': {
            schema: z.array(StylistSchema),
          },
        },
      },
    },
  });

  // Services: GET /api/v1/services
  registry.registerPath({
    method: 'get',
    path: '/api/v1/services',
    summary: 'Catalogue des Prestations & Soins',
    description: 'Liste les prestations (Coiffure, Coloration, Lissage, Balayage) avec tarification MAD et fenêtres de pause chimique.',
    tags: ['Services'],
    request: {
      query: z.object({
        branchId: z.string().uuid().optional().openapi({ description: 'Filtrer par succursale' }),
      }),
    },
    responses: {
      200: {
        description: 'Catalogue des prestations',
        content: {
          'application/json': {
            schema: z.array(ServiceSchema),
          },
        },
      },
    },
  });

  // Appointments: GET /api/v1/appointments
  registry.registerPath({
    method: 'get',
    path: '/api/v1/appointments',
    summary: 'Planning & Rendez-vous',
    description: 'Consulte l’agenda du salon filtrable par coiffeuse, date et succursale.',
    tags: ['Appointments'],
    request: {
      query: z.object({
        stylistId: z.string().uuid().optional().openapi({ description: 'Identifiant de la coiffeuse' }),
        date: z.string().optional().openapi({ example: '2026-09-25', description: 'Date de consultation (YYYY-MM-DD)' }),
        branchId: z.string().uuid().optional().openapi({ description: 'Identifiant succursale' }),
      }),
    },
    responses: {
      200: {
        description: 'Liste des rendez-vous',
        content: {
          'application/json': {
            schema: z.array(AppointmentSchema),
          },
        },
      },
    },
  });

  // Appointments: POST /api/v1/appointments
  registry.registerPath({
    method: 'post',
    path: '/api/v1/appointments',
    summary: 'Réservation de Rendez-vous avec Verrou Redlock',
    description: 'Crée un nouveau rendez-vous avec vérification anti-chevauchement (durée prestation + tampon chimique).',
    tags: ['Appointments'],
    request: {
      body: {
        content: {
          'application/json': {
            schema: CreateAppointmentRequestSchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: 'Rendez-vous créé avec succès',
        content: {
          'application/json': {
            schema: AppointmentSchema,
          },
        },
      },
      409: {
        description: 'Créneau en conflit (Slot Collision)',
        content: {
          'application/json': {
            schema: BilingualErrorResponseSchema,
          },
        },
      },
    },
  });

  // Appointments: PATCH /api/v1/appointments/{id}/status
  registry.registerPath({
    method: 'patch',
    path: '/api/v1/appointments/{id}/status',
    summary: 'Mise à Jour du Statut de Rendez-vous',
    description: 'Fait évoluer le statut du rendez-vous (CONFIRMED -> IN_CHAIR -> COMPLETED / CANCELLED).',
    tags: ['Appointments'],
    request: {
      params: z.object({
        id: z.string().uuid().openapi({ description: 'Identifiant du rendez-vous' }),
      }),
      body: {
        content: {
          'application/json': {
            schema: UpdateAppointmentStatusRequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Statut mis à jour',
        content: {
          'application/json': {
            schema: AppointmentSchema,
          },
        },
      },
      404: {
        description: 'Rendez-vous introuvable',
        content: {
          'application/json': {
            schema: ErrorResponseSchema,
          },
        },
      },
    },
  });

  // Clients: GET /api/v1/clients/search
  registry.registerPath({
    method: 'get',
    path: '/api/v1/clients/search',
    summary: 'Recherche de Clientes',
    description: 'Recherche des clientes par nom ou numéro de téléphone marocain.',
    tags: ['Clients'],
    request: {
      query: z.object({
        q: z.string().optional().openapi({ example: 'Meryem', description: 'Terme de recherche (nom ou téléphone)' }),
        branchId: z.string().uuid().optional().openapi({ description: 'Identifiant de succursale' }),
      }),
    },
    responses: {
      200: {
        description: 'Résultats de recherche',
        content: {
          'application/json': {
            schema: z.array(ClientSchema),
          },
        },
      },
    },
  });

  // Clients: GET /api/v1/clients/{id}/formulas
  registry.registerPath({
    method: 'get',
    path: '/api/v1/clients/{id}/formulas',
    summary: 'Coffre-fort des Formules Chimiques de la Cliente',
    description: 'Consulte l’historique des recettes de décoloration, volumes d’oxydant et photos avant/après S3.',
    tags: ['Clients'],
    request: {
      params: z.object({
        id: z.string().uuid().openapi({ description: 'Identifiant de la cliente' }),
      }),
    },
    responses: {
      200: {
        description: 'Historique des formules chimiques',
        content: {
          'application/json': {
            schema: z.array(HairFormulaSchema),
          },
        },
      },
    },
  });

  // Clients: POST /api/v1/clients/{id}/formulas
  registry.registerPath({
    method: 'post',
    path: '/api/v1/clients/{id}/formulas',
    summary: 'Enregistrement d’une Formule Capillaire',
    description: 'Enregistre une nouvelle formule technique de coloration/lissage avec suivi d’allergie et photos S3.',
    tags: ['Clients'],
    request: {
      params: z.object({
        id: z.string().uuid().openapi({ description: 'Identifiant de la cliente' }),
      }),
      body: {
        content: {
          'application/json': {
            schema: CreateHairFormulaRequestSchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: 'Formule enregistrée avec succès',
        content: {
          'application/json': {
            schema: HairFormulaSchema,
          },
        },
      },
    },
  });

  // Checkout: POST /api/v1/checkout
  registry.registerPath({
    method: 'post',
    path: '/api/v1/checkout',
    summary: 'Enregistrement de Caisse & Split Ledger',
    description: 'Valide l’encaissement d’un soin en Espèces, TPE Carte Bancaire ou Split avec calcul automatique de commission coiffeuse.',
    tags: ['POS Checkout'],
    request: {
      body: {
        content: {
          'application/json': {
            schema: ProcessCheckoutRequestSchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: 'Paiement et ventilation caisse enregistrés',
        content: {
          'application/json': {
            schema: TransactionSchema,
          },
        },
      },
      400: {
        description: 'Invariants de paiement non respectés (Sous-paiement ou ventilations incorrectes)',
        content: {
          'application/json': {
            schema: BilingualErrorResponseSchema,
          },
        },
      },
    },
  });

  // Caisse Reconciliation: GET /api/v1/checkout/reconciliation
  registry.registerPath({
    method: 'get',
    path: '/api/v1/checkout/reconciliation',
    summary: 'Rapprochement de Caisse de Fin de Journée',
    description: 'Calcule les totaux d’encaissement (Espèces, TPE, Pourboires, Commissions) et vérifie les écarts de caisse.',
    tags: ['POS Checkout'],
    parameters: [
      {
        name: 'branchId',
        in: 'query',
        required: false,
        schema: { type: 'string', format: 'uuid' },
        description: 'Identifiant succursale',
      },
      {
        name: 'date',
        in: 'query',
        required: false,
        schema: { type: 'string' },
        description: 'Date de réconciliation (YYYY-MM-DD)',
      },
      {
        name: 'openingCashMad',
        in: 'query',
        required: false,
        schema: { type: 'number' },
        description: 'Fond de caisse initial en MAD',
      },
      {
        name: 'actualCashMad',
        in: 'query',
        required: false,
        schema: { type: 'number' },
        description: 'Montant physique compté dans le tiroir-caisse en MAD',
      },
    ],
    responses: {
      200: {
        description: 'Rapport de réconciliation de caisse généré avec succès',
        content: {
          'application/json': {
            schema: CaisseReconciliationSchema,
          },
        },
      },
      400: {
        description: 'Paramètres invalides',
        content: {
          'application/json': {
            schema: BilingualErrorResponseSchema,
          },
        },
      },
    },
  });

  // Get Transaction by ID: GET /api/v1/checkout/{id}
  registry.registerPath({
    method: 'get',
    path: '/api/v1/checkout/{id}',
    summary: 'Détails d’un Encaissement de Caisse',
    description: 'Récupère les détails financiers d’une transaction par son identifiant unique.',
    tags: ['POS Checkout'],
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
        description: 'Identifiant unique de la transaction',
      },
    ],
    responses: {
      200: {
        description: 'Détails de la transaction',
        content: {
          'application/json': {
            schema: TransactionSchema,
          },
        },
      },
      404: {
        description: 'Transaction introuvable',
        content: {
          'application/json': {
            schema: BilingualErrorResponseSchema,
          },
        },
      },
    },
  });

  // Build final OpenAPI 3.1 Document
  const generator = new OpenApiGeneratorV31(registry.definitions);

  return generator.generateDocument({
    openapi: '3.1.0',
    info: {
      title: 'SalonOps Morocco 🇲🇦 API Reference',
      version: '1.0.0',
      description:
        'Spécification OpenAPI 3.1 interactive et source de vérité des contrats d’API pour les applications Floor Staff Mobile (React Native Expo), Admin Portal (React 19) et Web Client de SalonOps.',
      contact: {
        name: 'Anas Dalfag (@dalfaganis)',
        email: 'dalfaganis@gmail.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Environnement de développement local API',
      },
      {
        url: 'https://api.salonops.ma',
        description: 'Serveur de Production SalonOps Maroc',
      },
    ],
  });
}
