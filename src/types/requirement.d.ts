export type Budget = {
  from: number;
  to: number;
};
export interface Requirement {
  requirementId: string;
  agentPhoneNumber: string;
  agentName: string;
  cpId: string;
  assetType:
    | "villa"
    | "apartment"
    | "plot"
    | "commercial"
    | "warehouse"
    | "office";
  configuration: "1 bhk" | "2 bhk" | "3 bhk" | "4 bhk" | "5+ bhk" | null;
  micromarket: string;
  budget: Budget;
  area: number;
  kamId: string;
  kamName: string;
  kamPhoneNumber: string;
  bedrooms: string;
  bathrooms: string;
  parking: string;
  propertyName: string;
  extraDetails: string;
  marketValue: string;
  requirementStatus: "open" | "close";
  internalStatus: "found" | "not found" | "pending";
  added: number;
  lastModified: number;
  matchingProperties: string[];
}
