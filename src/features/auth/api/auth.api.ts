import { apiClient } from "@/lib/api";
import { type AuthResponse, type LoginInput, type SignupInput } from "@/types/domain";

/** The API starts the session by setting its cookie; the body only carries the user. */
export async function login(input: LoginInput) {
  const { data } = await apiClient.post<AuthResponse>("/auth/login", input, { skipRetry: true });
  return data;
}

export async function signup(input: SignupInput) {
  const { data } = await apiClient.post<AuthResponse>("/auth/signup", input, { skipRetry: true });
  return data;
}

export async function logout() {
  await apiClient.post("/auth/logout", undefined, { skipRetry: true });
}
