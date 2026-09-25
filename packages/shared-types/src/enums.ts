export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  OWNER = 'OWNER',
  MANAGER = 'MANAGER',
  STYLIST = 'STYLIST',
  RECEPTIONIST = 'RECEPTIONIST',
}

export enum AppointmentStatus {
  BOOKED = 'BOOKED',
  CONFIRMED = 'CONFIRMED',
  IN_CHAIR = 'IN_CHAIR',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export enum PaymentMethod {
  CASH = 'CASH',
  TPE_CARD = 'TPE_CARD',
  SPLIT = 'SPLIT',
}

export enum LoyaltyTier {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
}
