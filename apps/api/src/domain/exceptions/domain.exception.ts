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

export class LateCancellationException extends DomainException {
  constructor(message: string = 'Le délai minimum de prévenance pour annulation n’a pas été respecté.') {
    super(message);
  }
}

export class PrematureNoShowException extends DomainException {
  constructor(message: string = 'Impossible de déclarer une absence avant l’expiration de la période de grâce.') {
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

export class InvalidCredentialsException extends DomainException {
  constructor(message: string = 'Numéro de téléphone ou mot de passe incorrect.') {
    super(message);
  }
}

export class UnauthorizedAccessException extends DomainException {
  constructor(message: string = 'Accès non autorisé ou autorisations insuffisantes.') {
    super(message);
  }
}

export class UnsupportedFileTypeException extends DomainException {
  constructor(message: string = 'Format de fichier non supporté. Seules les images (JPEG, PNG, WebP, HEIC) ou PDF sont acceptés.') {
    super(message);
  }
}

export class FileTooLargeException extends DomainException {
  constructor(maxSizeMb: number) {
    super(`Fichier trop volumineux. La taille maximale autorisée est de ${maxSizeMb} Mo.`);
  }
}

export class InvalidStorageBucketException extends DomainException {
  constructor(bucket: string) {
    super(`Bucket de stockage invalide ou non autorisé: "${bucket}".`);
  }
}

export class CrossTenantAccessException extends DomainException {
  constructor(message: string = "Accès inter-succursales interdit : vous n'avez pas l'autorisation d'accéder aux données de cette succursale.") {
    super(message);
  }
}

export class TenantContextMissingException extends DomainException {
  constructor(message: string = 'Contexte de succursale manquant pour cette opération.') {
    super(message);
  }
}


