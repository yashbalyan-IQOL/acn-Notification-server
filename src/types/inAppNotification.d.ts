export interface SaveNotificationInput {
    body: string;
    cpCode: string;
    cta: any[];
    image?: string;
    title: string;
    type: string;
    // propertyId?: string;
    // phoneNumber?: string | null;
    meta?: any;
    [key: string]: any;
  }