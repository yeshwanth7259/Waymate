const PHONE_AUTH_ERRORS: Record<string, string> = {
  'auth/operation-not-allowed': 'Phone sign-in is disabled for this Firebase project. Enable Authentication → Sign-in method → Phone.',
  'auth/billing-not-enabled': 'Firebase cannot send real verification SMS until billing is enabled for this project. Ask a Firebase project owner to check the project billing plan.',
  'auth/too-many-requests': 'Firebase temporarily blocked SMS requests for this number or device. Wait before trying again.',
  'auth/quota-exceeded': 'This Firebase project has reached its SMS quota. Check Firebase Usage and billing before retrying.',
  'auth/invalid-api-key': 'The Firebase Web API key is invalid. Check the Web app configuration in web/.env.local and restart the website.',
  'auth/invalid-app-credential': 'Firebase could not verify this website. Check the Firebase Web app configuration and authorized domain.',
  'auth/captcha-check-failed': 'Firebase could not verify this website. Add its exact hostname under Authentication → Settings → Authorized domains.',
  'auth/app-not-authorized': 'This website is not authorized for Firebase Phone Auth. Add its hostname under Authentication → Settings → Authorized domains.',
  'auth/unauthorized-domain': 'This website hostname is not authorized for Firebase Phone Auth. Add it under Authentication → Settings → Authorized domains.',
  'auth/invalid-phone-number': 'Enter a valid phone number in international format, for example +919876543210.',
  'auth/invalid-verification-code': 'That verification code is incorrect. Check the latest SMS and try again.',
  'auth/code-expired': 'That verification code has expired. Request a new code and enter the newest SMS.',
  'auth/session-expired': 'This verification session expired. Request a new code and try again.',
  'auth/network-request-failed': 'Could not connect to Firebase. Check your internet connection and try again.',
  'auth/internal-error': 'Firebase could not send the verification SMS. Check Phone sign-in, the SMS region policy, billing, quotas, and the authorized domain with a project owner.',
};

export function normalizePhoneNumber(input: string): string | null {
  const value = input.trim();
  if (!value) return null;
  const international = value.startsWith('+') || value.startsWith('00');
  let digits = value.replace(/\D/g, '');
  if (value.startsWith('00')) digits = digits.slice(2);
  if (international) return /^[1-9]\d{7,14}$/.test(digits) ? `+${digits}` : null;
  if (digits.startsWith('0')) digits = digits.slice(1);
  if (digits.length === 10) return `+91${digits}`;
  if (digits.startsWith('91') && digits.length === 12) return `+${digits}`;
  return null;
}

export function phoneAuthErrorMessage(error: unknown): string {
  const code = typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code: unknown }).code)
    : '';
  if (PHONE_AUTH_ERRORS[code]) return PHONE_AUTH_ERRORS[code];
  return error instanceof Error && error.message
    ? error.message
    : 'Phone verification failed. Check your number and Firebase configuration, then try again.';
}
