import { DrizzleAppointmentRepository } from './persistence/drizzle-appointment.repository';
import { DrizzleStylistRepository } from './persistence/drizzle-stylist.repository';
import { DrizzleClientRepository } from './persistence/drizzle-client.repository';
import { DrizzleServiceRepository } from './persistence/drizzle-service.repository';
import { DrizzleHairFormulaRepository } from './persistence/drizzle-hair-formula.repository';
import { DrizzleTransactionRepository } from './persistence/drizzle-transaction.repository';
import { RedisDistributedLockAdapter } from './concurrency/redis-distributed-lock.adapter';

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

export interface AppContainer {
  // Repositories (Driven Adapters)
  appointmentRepo: DrizzleAppointmentRepository;
  stylistRepo: DrizzleStylistRepository;
  clientRepo: DrizzleClientRepository;
  serviceRepo: DrizzleServiceRepository;
  hairFormulaRepo: DrizzleHairFormulaRepository;
  transactionRepo: DrizzleTransactionRepository;
  lockService: RedisDistributedLockAdapter;

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
}

export function createContainer(): AppContainer {
  // Outbound Driven Adapters
  const appointmentRepo = new DrizzleAppointmentRepository();
  const stylistRepo = new DrizzleStylistRepository();
  const clientRepo = new DrizzleClientRepository();
  const serviceRepo = new DrizzleServiceRepository();
  const hairFormulaRepo = new DrizzleHairFormulaRepository();
  const transactionRepo = new DrizzleTransactionRepository();
  const lockService = new RedisDistributedLockAdapter();

  // Application Use Cases
  const bookAppointmentUseCase = new BookAppointmentUseCase(
    appointmentRepo,
    stylistRepo,
    serviceRepo,
    clientRepo,
    lockService
  );

  const getAppointmentsUseCase = new GetAppointmentsUseCase(appointmentRepo);
  const updateAppointmentStatusUseCase = new UpdateAppointmentStatusUseCase(appointmentRepo);
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

  return {
    appointmentRepo,
    stylistRepo,
    clientRepo,
    serviceRepo,
    hairFormulaRepo,
    transactionRepo,
    lockService,

    bookAppointmentUseCase,
    getAppointmentsUseCase,
    updateAppointmentStatusUseCase,
    getStylistsUseCase,
    getServicesUseCase,
    searchClientsUseCase,
    getClientFormulasUseCase,
    saveHairFormulaUseCase,
    processCheckoutUseCase,
  };
}
