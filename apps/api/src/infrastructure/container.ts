import { DrizzleAppointmentRepository } from './persistence/drizzle-appointment.repository';
import { DrizzleStylistRepository } from './persistence/drizzle-stylist.repository';
import { DrizzleClientRepository } from './persistence/drizzle-client.repository';
import { DrizzleServiceRepository } from './persistence/drizzle-service.repository';
import { DrizzleHairFormulaRepository } from './persistence/drizzle-hair-formula.repository';
import { DrizzleTransactionRepository } from './persistence/drizzle-transaction.repository';
import { DrizzleUserRepository } from './persistence/drizzle-user.repository';
import { RedisDistributedLockAdapter } from './concurrency/redis-distributed-lock.adapter';
import { Argon2PasswordHasherAdapter } from './security/argon2-password-hasher.adapter';
import { JwtTokenAdapter } from './security/jwt-token.adapter';
import { MinioStorageAdapter } from './storage/minio-storage.adapter';
import { IObjectStoragePort } from '../domain/ports/object-storage.port';
import { ITenantContextPort } from '../domain/ports/tenant-context.port';
import { AsyncLocalStorageTenantContextAdapter } from './tenant/async-local-storage-tenant-context.adapter';
import { MemoryWalkInTicketAdapter } from './walk-in/memory-walk-in-ticket.adapter';

import { BookAppointmentUseCase } from '../application/use-cases/book-appointment.use-case';
import { GetAppointmentsUseCase } from '../application/use-cases/get-appointments.use-case';
import { UpdateAppointmentStatusUseCase } from '../application/use-cases/update-appointment-status.use-case';
import { GetStylistsUseCase } from '../application/use-cases/get-stylists.use-case';
import { GetServicesUseCase } from '../application/use-cases/get-services.use-case';
import { SearchClientsUseCase } from '../application/use-cases/search-clients.use-case';
import {
  GetClientFormulasUseCase,
  SaveHairFormulaUseCase,
} from '../application/use-cases/hair-formulas.use-cases';
import { ProcessCheckoutUseCase } from '../application/use-cases/process-checkout.use-case';
import { GetCaisseReconciliationUseCase } from '../application/use-cases/get-caisse-reconciliation.use-case';
import { AuthenticateUserUseCase } from '../application/use-cases/authenticate-user.use-case';
import { GenerateUploadUrlUseCase } from '../application/use-cases/generate-upload-url.use-case';
import { CreateWalkInUseCase } from '../application/use-cases/create-walk-in.use-case';

export interface AppContainer {
  // Repositories & Adapters (Driven Adapters)
  appointmentRepo: DrizzleAppointmentRepository;
  stylistRepo: DrizzleStylistRepository;
  clientRepo: DrizzleClientRepository;
  serviceRepo: DrizzleServiceRepository;
  hairFormulaRepo: DrizzleHairFormulaRepository;
  transactionRepo: DrizzleTransactionRepository;
  userRepo: DrizzleUserRepository;
  lockService: RedisDistributedLockAdapter;
  passwordHasher: Argon2PasswordHasherAdapter;
  tokenService: JwtTokenAdapter;
  storageAdapter: IObjectStoragePort;
  tenantContextPort: ITenantContextPort;
  walkInTicketPort: MemoryWalkInTicketAdapter;

  // Use Cases (Application Layer Inbound Ports)
  bookAppointmentUseCase: BookAppointmentUseCase;
  getAppointmentsUseCase: GetAppointmentsUseCase;
  updateAppointmentStatusUseCase: UpdateAppointmentStatusUseCase;
  getStylistsUseCase: GetStylistsUseCase;
  getServicesUseCase: GetServicesUseCase;
  searchClientsUseCase: SearchClientsUseCase;
  getClientFormulasUseCase: GetClientFormulasUseCase;
  saveHairFormulaUseCase: SaveHairFormulaUseCase;
  processCheckoutUseCase: ProcessCheckoutUseCase;
  getCaisseReconciliationUseCase: GetCaisseReconciliationUseCase;
  authenticateUserUseCase: AuthenticateUserUseCase;
  generateUploadUrlUseCase: GenerateUploadUrlUseCase;
  createWalkInUseCase: CreateWalkInUseCase;
}


export function createContainer(): AppContainer {
  // Tenant Context Ambient Port (AsyncLocalStorage)
  const tenantContextPort = new AsyncLocalStorageTenantContextAdapter();

  // Outbound Driven Adapters
  const appointmentRepo = new DrizzleAppointmentRepository(tenantContextPort);
  const stylistRepo = new DrizzleStylistRepository(tenantContextPort);
  const clientRepo = new DrizzleClientRepository(tenantContextPort);
  const serviceRepo = new DrizzleServiceRepository(tenantContextPort);
  const hairFormulaRepo = new DrizzleHairFormulaRepository();
  const transactionRepo = new DrizzleTransactionRepository(tenantContextPort);
  const userRepo = new DrizzleUserRepository();
  const lockService = new RedisDistributedLockAdapter();
  const passwordHasher = new Argon2PasswordHasherAdapter();
  const tokenService = new JwtTokenAdapter();
  const storageAdapter = new MinioStorageAdapter();
  const walkInTicketPort = new MemoryWalkInTicketAdapter();

  // Application Use Cases
  const bookAppointmentUseCase = new BookAppointmentUseCase(
    appointmentRepo,
    stylistRepo,
    serviceRepo,
    clientRepo,
    lockService,
    tenantContextPort
  );

  const getAppointmentsUseCase = new GetAppointmentsUseCase(appointmentRepo, tenantContextPort);
  const updateAppointmentStatusUseCase = new UpdateAppointmentStatusUseCase(
    appointmentRepo,
    clientRepo,
    tenantContextPort
  );
  const getStylistsUseCase = new GetStylistsUseCase(stylistRepo, tenantContextPort);
  const getServicesUseCase = new GetServicesUseCase(serviceRepo, tenantContextPort);
  const searchClientsUseCase = new SearchClientsUseCase(clientRepo, tenantContextPort);
  const getClientFormulasUseCase = new GetClientFormulasUseCase(hairFormulaRepo, clientRepo);
  const saveHairFormulaUseCase = new SaveHairFormulaUseCase(hairFormulaRepo, clientRepo);
  const processCheckoutUseCase = new ProcessCheckoutUseCase(
    transactionRepo,
    appointmentRepo,
    stylistRepo,
    clientRepo,
    tenantContextPort
  );
  const getCaisseReconciliationUseCase = new GetCaisseReconciliationUseCase(
    transactionRepo,
    tenantContextPort
  );
  const authenticateUserUseCase = new AuthenticateUserUseCase(
    userRepo,
    passwordHasher,
    tokenService
  );
  const generateUploadUrlUseCase = new GenerateUploadUrlUseCase(storageAdapter);
  const createWalkInUseCase = new CreateWalkInUseCase(
    appointmentRepo,
    clientRepo,
    stylistRepo,
    walkInTicketPort
  );

  return {
    appointmentRepo,
    stylistRepo,
    clientRepo,
    serviceRepo,
    hairFormulaRepo,
    transactionRepo,
    userRepo,
    lockService,
    passwordHasher,
    tokenService,
    storageAdapter,
    tenantContextPort,
    walkInTicketPort,

    bookAppointmentUseCase,
    getAppointmentsUseCase,
    updateAppointmentStatusUseCase,
    getStylistsUseCase,
    getServicesUseCase,
    searchClientsUseCase,
    getClientFormulasUseCase,
    saveHairFormulaUseCase,
    processCheckoutUseCase,
    getCaisseReconciliationUseCase,
    authenticateUserUseCase,
    generateUploadUrlUseCase,
    createWalkInUseCase,
  };
}


