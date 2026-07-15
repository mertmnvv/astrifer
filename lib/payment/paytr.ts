import "server-only";

import crypto from "crypto";

export interface PaytrBasketItem {
  name: string;
  price: string; // e.g. "2400.00"
  quantity: number;
}

export interface GetPaytrTokenInput {
  userIp: string;
  merchantOid: string; // Order Number, e.g. AST-20260715-A3K8
  email: string;
  totalAmount: number; // e.g. 2400.00
  userName: string;
  userAddress: string;
  userPhone: string;
  basketItems: PaytrBasketItem[];
  merchantOkUrl: string;
  merchantFailUrl: string;
  hasPhysicalProduct: boolean;
}

/**
 * Initiates payment with PayTR. Sends merchant and order details to PayTR
 * to receive a one-time secure iFrame token.
 */
export async function getPaytrToken(input: GetPaytrTokenInput): Promise<string> {
  const merchantId = process.env.PAYTR_MERCHANT_ID || "";
  const merchantKey = process.env.PAYTR_MERCHANT_KEY || "";
  const merchantSalt = process.env.PAYTR_MERCHANT_SALT || "";
  const testMode = process.env.PAYTR_TEST_MODE || (process.env.NODE_ENV === "development" ? "1" : "0");

  const paymentAmount = Math.round(input.totalAmount * 100); // PayTR expects amount in cents
  
  // PayTR expects basket items as a base64 encoded JSON array of arrays: [ [name, price, quantity], ... ]
  const formattedBasket = input.basketItems.map((item) => [item.name, item.price, item.quantity]);
  const userBasket = Buffer.from(JSON.stringify(formattedBasket)).toString("base64");

  const noShipping = input.hasPhysicalProduct ? "0" : "1";
  const credentialSharing = "0";
  const paymentType = "card"; // Default credit/debit card payment
  const currency = "TL"; // PayTR expects "TL"

  // Concatenate parameters in the exact cryptographic order defined by PayTR
  const hashString = 
    merchantId + 
    input.userIp + 
    input.merchantOid + 
    input.email + 
    paymentAmount.toString() + 
    userBasket + 
    noShipping + 
    credentialSharing + 
    paymentType + 
    currency + 
    testMode + 
    merchantSalt;

  // Compute the secure HMAC-SHA256 signature
  const paytrToken = crypto
    .createHmac("sha256", merchantKey)
    .update(hashString)
    .digest("base64");

  const formData = new URLSearchParams();
  formData.append("merchant_id", merchantId);
  formData.append("user_ip", input.userIp);
  formData.append("merchant_oid", input.merchantOid);
  formData.append("email", input.email);
  formData.append("payment_amount", paymentAmount.toString());
  formData.append("paytr_token", paytrToken);
  formData.append("user_basket", userBasket);
  formData.append("user_name", input.userName);
  formData.append("user_address", input.userAddress);
  formData.append("user_phone", input.userPhone);
  formData.append("merchant_ok_url", input.merchantOkUrl);
  formData.append("merchant_fail_url", input.merchantFailUrl);
  formData.append("no_shipping", noShipping);
  formData.append("credential_sharing", credentialSharing);
  formData.append("payment_type", paymentType);
  formData.append("currency", currency);
  formData.append("test_mode", testMode);
  formData.append("debug_on", "1"); // Enable debugging output for setup verification
  formData.append("timeout_limit", "30"); // iFrame session timeout in minutes

  const response = await fetch("https://www.paytr.com/odeme/api/get-token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    throw new Error(`PayTR API returned HTTP status ${response.status}`);
  }

  const result = await response.json();
  if (result.status === "failed") {
    throw new Error(`PayTR Token generation failed: ${result.reason}`);
  }

  return result.token;
}

export interface VerifyCallbackInput {
  merchant_oid: string;
  status: string;
  total_amount: string;
  hash: string;
}

/**
 * Validates the cryptographic signature sent in the PayTR webhook callback.
 * Prevents spoofing attacks by confirming the hash matches our merchant key/salt.
 */
export function verifyPaytrCallbackSignature(params: VerifyCallbackInput): boolean {
  const merchantSalt = process.env.PAYTR_MERCHANT_SALT || "";
  const merchantKey = process.env.PAYTR_MERCHANT_KEY || "";

  // Webhook hash payload signature is defined by PayTR as: merchant_oid + merchant_salt + status + total_amount
  const hashString = params.merchant_oid + merchantSalt + params.status + params.total_amount;
  const expectedHash = crypto
    .createHmac("sha256", merchantKey)
    .update(hashString)
    .digest("base64");

  return expectedHash === params.hash;
}
