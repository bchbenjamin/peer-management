export function normalizeTotpSecret(secret: string | undefined | null) {
  return (secret || '').replace(/^["']|["']$/g, '').replace(/\s+/g, '').toUpperCase();
}

export function normalizeTotpToken(token: string | undefined | null) {
  return (token || '').replace(/\D/g, '').slice(0, 6);
}
