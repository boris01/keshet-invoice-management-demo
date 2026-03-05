export const InvoiceStatus = {
  APPROVED: 'APPROVED',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  IN_PROCESS: 'IN_PROCESS',
  REJECTED: 'REJECTED',
} as const;

export type InvoiceStatus = (typeof InvoiceStatus)[keyof typeof InvoiceStatus];
