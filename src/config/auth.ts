/**
 * Session contract shared by the app, the auth proxy and the mock API.
 *
 * The API owns the session: it sets this cookie on login/sign-up and clears it
 * on logout (the real backend sets it HttpOnly; the mock sets it from the
 * browser). The client never stores a token.
 */
export const SESSION_COOKIE_NAME = "sn_session";

/** Query-string key the proxy uses to send a guest back to where they were headed. */
export const RETURN_TO_PARAM = "returnTo";
