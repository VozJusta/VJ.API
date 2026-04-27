export type AuthResult =
  | { type: 'redirect'; url: string }
  | { type: 'json'; data: Record<string, unknown>; token: string };
