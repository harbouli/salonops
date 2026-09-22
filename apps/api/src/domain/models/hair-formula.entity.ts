export interface HairFormulaProps {
  id: string;
  clientId: string;
  appointmentId?: string | null;
  stylistId: string;
  visitDate: Date;
  brand: string;
  shadeFormula: string;
  developerVolume: string;
  processingTimeMinutes: number;
  beforePhotoUrl?: string | null;
  afterPhotoUrl?: string | null;
  scalpAlert?: string | null;
  notes?: string | null;
  createdAt?: Date;
}

export class HairFormula {
  public readonly id: string;
  public readonly clientId: string;
  public readonly appointmentId?: string | null;
  public readonly stylistId: string;
  public readonly visitDate: Date;
  public readonly brand: string;
  public readonly shadeFormula: string;
  public readonly developerVolume: string;
  public readonly processingTimeMinutes: number;
  public readonly beforePhotoUrl?: string | null;
  public readonly afterPhotoUrl?: string | null;
  public readonly scalpAlert?: string | null;
  public readonly notes?: string | null;
  public readonly createdAt: Date;

  constructor(props: HairFormulaProps) {
    this.id = props.id;
    this.clientId = props.clientId;
    this.appointmentId = props.appointmentId ?? null;
    this.stylistId = props.stylistId;
    this.visitDate = props.visitDate;
    this.brand = props.brand;
    this.shadeFormula = props.shadeFormula;
    this.developerVolume = props.developerVolume;
    this.processingTimeMinutes = props.processingTimeMinutes;
    this.beforePhotoUrl = props.beforePhotoUrl ?? null;
    this.afterPhotoUrl = props.afterPhotoUrl ?? null;
    this.scalpAlert = props.scalpAlert ?? null;
    this.notes = props.notes ?? null;
    this.createdAt = props.createdAt ?? new Date();
  }
}
