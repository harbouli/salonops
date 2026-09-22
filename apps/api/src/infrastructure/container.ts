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
import { AuthenticateUserUseCase } from '../application/use-cases/authenticate-user.use-case';

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
  authenticateUserUseCase: AuthenticateUserUseCase;
}

export function createContainer(): AppContainer {
  // Outbound Driven Adapters
  const appointmentRepo = new DrizzleAppointmentRepository();
  const stylistRepo = new DrizzleStylistRepository();
  const clientRepo = new DrizzleClientRepository();
  const serviceRepo = new DrizzleServiceRepository();
  const hairFormulaRepo = new DrizzleHairFormulaRepository();
  const transactionRepo = new DrizzleTransactionRepository();
  const userRepo = new DrizzleUserRepository();
  const lockService = new RedisDistributedLockAdapter();
  const passwordHasher = new Argon2PasswordHasherAdapter();
  const tokenService = new JwtTokenAdapter();

  // Application Use Cases
  const bookAppointmentUseCase = new BookAppointmentUseCase(
    appointmentRepo,
    stylistRepo,
    serviceRepo,
    clientRepo,
    lockService
  );

  const getAppointmentsUseCase = new GetAppointmentsUseCase(appointmentRepo);
  const updateAppointmentStatusUseCase = new UpdateAppointmentStatusUseCase(appointmentRepo, clientRepo);
  const getStylistsUseCase = new GetStylistsUseCase(stylistRepo);
  const getServicesUseCase = new GetServicesUseCase(serviceRepo);
  const searchClientsUseCase = new SearchClientsUseCase(clientRepo);
  const getClientFormulasUseCase = new GetClientFormulasUseCase(hairFormulaRepo, clientRepo);
  const saveHairFormulaUseCase = new SaveHairFormulaUseCase(hairFormulaRepo, clientRepo);
  const processCheckoutUseCase = new ProcessCheckoutUseCase(
    transactionRepo,
    appointmentRepo,
    stylistRepo,
    clientRepo
  );
  const authenticateUserUseCase = new AuthenticateUserUseCase(
    userRepo,
    passwordHasher,
    tokenService
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

    bookAppointmentUseCase,
    getAppointmentsUseCase,
    updateAppointmentStatusUseCase,
    getStylistsUseCase,
    getServicesUseCase,
    searchClientsUseCase,
    getClientFormulasUseCase,
    saveHairFormulaUseCase,
    processCheckoutUseCase,
    authenticateUserUseCase,
  };
}
