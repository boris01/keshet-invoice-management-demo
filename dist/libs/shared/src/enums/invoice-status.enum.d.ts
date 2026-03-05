export declare const InvoiceStatus: {
    readonly APPROVED: "APPROVED";
    readonly PENDING_APPROVAL: "PENDING_APPROVAL";
    readonly IN_PROCESS: "IN_PROCESS";
    readonly REJECTED: "REJECTED";
};
export type InvoiceStatus = (typeof InvoiceStatus)[keyof typeof InvoiceStatus];
