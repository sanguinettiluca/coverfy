export type InsuranceType =
  | "VEHICLE"
  | "TRIP"
  | "RENTAL"
  | "HOME"
  | "BUSINESS"
  | "LIABILITY"
  | "BOND"
  | "LIFE"
  | "OTHER";

export type CoverageForm = {
  name: string;
  insuranceType: InsuranceType | "";
  companyId: string;
};