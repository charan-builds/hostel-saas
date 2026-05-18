import "server-only";

export type PaymentProviderName = "cashfree";

export type PaymentSessionCustomer = {
  email?: string | null | undefined;
  id: string;
  name?: string | null | undefined;
  phone?: string | null | undefined;
};

export type CreatePaymentSessionInput = {
  amountCents: number;
  currencyCode: string;
  customer: PaymentSessionCustomer;
  idempotencyKey: string;
  invoiceId: string;
  notifyUrl: string;
  orderId: string;
  requestId: string;
  returnUrl: string;
};

export type PaymentSession = {
  amountCents: number;
  checkoutMode: "cashfree_payment_session";
  currencyCode: string;
  expiresAt?: string | undefined;
  orderId: string;
  paymentSessionId: string;
  provider: PaymentProviderName;
};

export type ProviderOrder = {
  amountCents: number;
  currencyCode: string;
  orderId: string;
  paymentSessionId?: string | undefined;
  status: "active" | "expired" | "paid" | "terminated" | "unknown";
};

export type VerifiedWebhook<Payload> = {
  eventId: string;
  eventTime?: string | undefined;
  eventType: string;
  payload: Payload;
};

export type PaymentProvider<Payload = unknown> = {
  createPaymentSession(input: CreatePaymentSessionInput): Promise<PaymentSession>;
  getOrder(orderId: string, requestId: string): Promise<ProviderOrder | null>;
  verifyWebhook(input: {
    providerEventId?: string | null | undefined;
    rawBody: string;
    signature: string | null;
    timestamp: string | null;
  }): VerifiedWebhook<Payload>;
};
