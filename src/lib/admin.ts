export const ADMIN_EMAILS = new Set([
  'yhanlhester@gmail.com',
  'illusivestudio.ph@gmail.com',
]);

export function isAdminEmail(email?: string | null) {
  return Boolean(email && ADMIN_EMAILS.has(email.toLowerCase()));
}
