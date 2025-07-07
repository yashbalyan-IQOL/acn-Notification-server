export interface SaveNotificationInput {
  body: string;
  cpId: string;
  cta: any[];
  image?: string;
  title: string;
  type: string;
  // propertyId?: string;
  // phoneNumber?: string | null;
  meta?: any;
  [key: string]: any;
}
