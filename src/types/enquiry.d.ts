export type Enquiry = {
    added: number;
    buyerCpId: string;
    buyerName: string;
    buyerNumber: string;
    enquiryId: string;
    propertyId: string;
    propertyName: string;
    sellerCpId: string;
    sellerName: string;
    sellerNumber: string;
};

export type EnquiryResponse = {
    success: boolean;
    message: string;
    data: Enquiry;
};
