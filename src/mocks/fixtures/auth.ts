/**
 * Accounts that exist in the mock backend from the first run. Mock data only:
 * the real API owns accounts, and nothing in the UI reads this file.
 * Anyone can also register a new account through the Sign Up form.
 */
export interface SeedAccount {
  fullName: string;
  email: string;
  password: string;
  creditBalance: number;
}

export const seedAccounts: SeedAccount[] = [
  {
    fullName: "John Michaels",
    email: "john.michaels@company.com",
    password: "Sambanova#2026",
    creditBalance: 25,
  },
];

/** Credit given to every account created through Sign Up. */
export const SIGNUP_CREDIT_BALANCE = 25;
