import { http, HttpResponse } from "msw";

import {
  CARD_BRAND_NAMES,
  checkExpiry,
  detectCardBrand,
  digitsOnly,
  isValidCardNumber,
  isValidSecurityCode,
  parseExpiry,
} from "@/lib/card";
import {
  type AddPaymentMethodInput,
  type CardDetails,
  type PurchaseCreditsInput,
  type PurchaseCreditsResponse,
  type UpdateAutoRechargeInput,
} from "@/types/domain";

import { addCreditsTo, findAccountBySession } from "../db/accounts";
import {
  addPaymentMethodFor,
  getAutoRechargeFor,
  getBillingAddress,
  getInvoiceFor,
  listInvoicesFor,
  listPaymentMethodsFor,
  recordCharge,
  removePaymentMethodFor,
  runAutoRechargeFor,
  updateAutoRechargeFor,
} from "../db/billing";
import { readSessionToken } from "../db/session-cookie";
import {
  CREDIT_AMOUNT_MAX,
  CREDIT_AMOUNT_MIN,
  DECLINED_TEST_CARD,
  RECHARGE_THRESHOLD_MAX,
  RECHARGE_THRESHOLD_MIN,
} from "../fixtures/billing";

import { api, notFound, validationError, withSession } from "./shared";

/** `withSession` has already rejected requests without a valid session. */
const signedInAccount = async () => (await findAccountBySession(readSessionToken()))!;

const isWholeDollarsIn = (value: unknown, min: number, max: number): value is number =>
  Number.isInteger(value) && (value as number) >= min && (value as number) <= max;

const declined = () =>
  HttpResponse.json(
    {
      error: {
        code: "PAYMENT_DECLINED",
        message: "Your card was declined",
        details: { field: "cardNumber" },
      },
    },
    { status: 402 },
  );

/** Same checks as the form, so a request that skips the UI gets the same field errors. */
function checkCard(card: Partial<CardDetails> | undefined) {
  if (!card || !isValidCardNumber(card.number ?? "")) {
    return validationError("Your Card number is invalid", { field: "cardNumber" });
  }
  if (!detectCardBrand(card.number ?? "")) {
    return validationError("We accept Visa, Mastercard, American Express and Discover", {
      field: "cardNumber",
    });
  }
  const expiry = checkExpiry(card.expiry ?? "");
  if (expiry !== "valid") {
    return validationError(
      expiry === "expired"
        ? "Your card's expiry date is in the past"
        : "Your card's expiry date is invalid",
      { field: "expiry" },
    );
  }
  if (!isValidSecurityCode(card.cvc ?? "")) {
    return validationError("Your card's security code is incomplete", { field: "cvc" });
  }
  return null;
}

/* ---- Invoice PDF ---- */

/** Escapes PDF string syntax. Helvetica's standard encoding has no non-ASCII, so those become "?". */
const pdfText = (value: string) =>
  value.replace(/[^\x20-\x7e]/g, "?").replace(/[\\()]/g, (char) => `\\${char}`);

/** A one-page PDF with the invoice lines; the real API returns the provider's invoice. */
function invoicePdf(lines: string[]) {
  const content = [
    "BT",
    "/F1 20 Tf 56 760 Td (SambaNova Cloud) Tj",
    "/F1 11 Tf 0 -36 Td",
    ...lines.map((line) => `(${pdfText(line)}) Tj 0 -18 Td`),
    "ET",
  ].join("\n");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = objects.map((body, index) => {
    const offset = pdf.length;
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
    return offset;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join("");
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return new TextEncoder().encode(pdf);
}

const usd = (amount: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

export const billingHandlers = [
  http.get(
    api("/billing/address"),
    withSession(async () => {
      const account = await signedInAccount();
      return HttpResponse.json(getBillingAddress(account.id));
    }),
  ),

  http.post(
    api("/billing/credits"),
    withSession(async ({ request }) => {
      const account = await signedInAccount();
      const { amount, billingAddress, card } =
        (await request.json()) as Partial<PurchaseCreditsInput>;

      if (!isWholeDollarsIn(amount, CREDIT_AMOUNT_MIN, CREDIT_AMOUNT_MAX)) {
        return validationError("Enter an amount between $5 and $1,000.", { field: "amount" });
      }
      // The dashboard sends an address; Billing doesn't and the saved one (if any) is used.
      if (billingAddress) {
        if (!billingAddress.fullName?.trim()) {
          return validationError("Enter your full name.", { field: "fullName" });
        }
        if (!billingAddress.country) {
          return validationError("Select your country or region.", { field: "country" });
        }
        if (!billingAddress.address?.trim()) {
          return validationError("Enter your address.", { field: "address" });
        }
      }
      const cardError = checkCard(card);
      if (cardError) return cardError;

      if (digitsOnly(card!.number) === DECLINED_TEST_CARD) {
        recordCharge(account.id, { amount, status: "failed", source: "purchase" });
        return declined();
      }

      const { purchase } = recordCharge(account.id, {
        amount,
        status: "completed",
        source: "purchase",
        address: billingAddress ?? null,
      });
      const balance = (await addCreditsTo(account.id, amount)) ?? 0;
      const body: PurchaseCreditsResponse = { balance, purchase: purchase! };
      return HttpResponse.json(body, { status: 201 });
    }),
  ),

  http.get(
    api("/billing/payment-methods"),
    withSession(async () => {
      const account = await signedInAccount();
      return HttpResponse.json(listPaymentMethodsFor(account.id));
    }),
  ),

  http.post(
    api("/billing/payment-methods"),
    withSession(async ({ request }) => {
      const account = await signedInAccount();
      const { card } = (await request.json()) as Partial<AddPaymentMethodInput>;
      const cardError = checkCard(card);
      if (cardError) return cardError;

      // The provider verifies a card before saving it, so the declined test card fails here too.
      const number = digitsOnly(card!.number);
      if (number === DECLINED_TEST_CARD) return declined();

      const brand = detectCardBrand(number)!;
      const { month, year } = parseExpiry(card!.expiry)!;
      const method = addPaymentMethodFor(account.id, {
        brand,
        last4: number.slice(-4),
        expMonth: month,
        expYear: year,
        declines: false,
      });
      if (!method) {
        return HttpResponse.json(
          {
            error: {
              code: "CARD_ALREADY_SAVED",
              message: `This ${CARD_BRAND_NAMES[brand]} card is already saved.`,
              details: { field: "cardNumber" },
            },
          },
          { status: 409 },
        );
      }
      return HttpResponse.json(method, { status: 201 });
    }),
  ),

  http.delete(
    api("/billing/payment-methods/:id"),
    withSession<{ id: string }>(async ({ params }) => {
      const account = await signedInAccount();
      if (!removePaymentMethodFor(account.id, params.id)) return notFound("Card");
      return new HttpResponse(null, { status: 204 });
    }),
  ),

  http.get(
    api("/billing/auto-recharge"),
    withSession(async () => {
      const account = await signedInAccount();
      return HttpResponse.json(getAutoRechargeFor(account.id));
    }),
  ),

  http.put(
    api("/billing/auto-recharge"),
    withSession(async ({ request }) => {
      const account = await signedInAccount();
      const input = (await request.json()) as Partial<UpdateAutoRechargeInput>;
      if (typeof input.enabled !== "boolean") {
        return validationError("Say whether Auto Recharge is on.", { field: "enabled" });
      }

      if (input.enabled) {
        if (!input.paymentMethodId) {
          return validationError("Select a payment method.", { field: "paymentMethodId" });
        }
        if (!isWholeDollarsIn(input.threshold, RECHARGE_THRESHOLD_MIN, RECHARGE_THRESHOLD_MAX)) {
          return validationError("Enter a balance between $1 and $1,000.", { field: "threshold" });
        }
        if (!isWholeDollarsIn(input.amount, CREDIT_AMOUNT_MIN, CREDIT_AMOUNT_MAX)) {
          return validationError("Enter an amount between $5 and $1,000.", { field: "amount" });
        }
      }

      const result = updateAutoRechargeFor(account.id, {
        enabled: input.enabled,
        threshold: input.threshold,
        amount: input.amount,
        paymentMethodId: input.paymentMethodId,
      });
      if (result.status === "unknown-card") {
        return validationError("That card is no longer saved.", { field: "paymentMethodId" });
      }
      // Turning it on while the balance is already low tops up straight away.
      if (input.enabled) await runAutoRechargeFor(account.id);
      return HttpResponse.json(result.settings);
    }),
  ),

  http.get(
    api("/billing/invoices"),
    withSession(async ({ request }) => {
      const account = await signedInAccount();
      const url = new URL(request.url);
      const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
      const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get("pageSize")) || 10));
      return HttpResponse.json(listInvoicesFor(account.id, page, pageSize));
    }),
  ),

  http.get(
    api("/billing/invoices/:id/pdf"),
    withSession<{ id: string }>(async ({ params }) => {
      const account = await signedInAccount();
      const invoice = getInvoiceFor(account.id, params.id);
      if (!invoice) return notFound("Invoice");

      const pdf = invoicePdf([
        `Invoice ${invoice.number}`,
        `Date: ${new Date(invoice.createdAt).toUTCString()}`,
        `Billed to: ${account.name} <${account.email}>`,
        `Description: ${invoice.source === "auto-recharge" ? "Auto Recharge credits" : "Credits purchase"}`,
        `Amount: ${usd(invoice.amount)}`,
        `Status: ${invoice.status === "completed" ? "Completed" : "Failed"}`,
      ]);
      return new HttpResponse(pdf, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${invoice.number}.pdf"`,
        },
      });
    }),
  ),
];
