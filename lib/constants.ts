export const BUSINESS = {
  name: "ARSH ENTERPRISES",
  gstin: "29AIGPR1899C1ZU",
  logoPath: "/arsh-enterprises-logo.png",
  phone: "",
  email: "",
  address: "Configure address in Settings",
  state: "Karnataka",
  invoicePrefix: "ARSH"
};

export const gstRates = ["0", "5", "12", "18", "28"];

export const itemTypes = ["PRODUCT", "SERVICE", "TICKET", "RECHARGE", "USED_PRODUCT", "OTHER"] as const;

export const paymentMethods = ["CASH", "UPI", "CARD", "BANK_TRANSFER", "OTHER"] as const;
