export class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class SlotCollisionException extends DomainException {
  constructor(message: string = 'Conflit de créneau : la coiffeuse a déjà un rendez-vous ou une pause active sur ce créneau.') {
    super(message);
  }
}

export class StylistUnavailableException extends DomainException {
  constructor(message: string = "La coiffeuse n'est pas disponible ou est en jour de repos.") {
    super(message);
  }
}

export class InvalidAppointmentStateException extends DomainException {
  constructor(message: string = 'Transition de statut de rendez-vous impossible.') {
    super(message);
  }
}

export class EntityNotFoundException extends DomainException {
  constructor(entityName: string, id: string) {
    super(`${entityName} avec l'identifiant "${id}" est introuvable.`);
  }
}

export class InvalidValueException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}
