const PHONE_AUTH_ERRORS: Record<string, string> = {
  'auth/operation-not-allowed': 'Phone sign-in is disabled for this Firebase project. Enable Authentication → Sign-in method → Phone.',
  'auth/billing-not-enabled': 'Firebase cannot send real verification SMS until billing is enabled for this project. Ask a Firebase project owner to check the project billing plan.',
  'auth/too-many-requests': 'Firebase temporarily blocked SMS requests for this number or device. Wait before trying again.',
  'auth/quota-exceeded': 'This Firebase project has reached its SMS quota. Check Firebase Usage and billing before retrying.',
  'auth/invalid-api-key': 'The Firebase app configuration is invalid. Check that this app uses the WayMate Firebase project, then rebuild and reinstall it.',
  'auth/captcha-check-failed': 'Firebase could not verify this app. Check the Android package, signing fingerprints, and Firebase app configuration, then install a newly built app.',
  'auth/invalid-app-credential': 'Firebase could not verify this Android app. Confirm the package and signing fingerprints in Firebase, then rebuild and reinstall.',
  'auth/app-not-authorized': 'This Android app is not authorized for Firebase Phone Auth. Check the registered package and signing fingerprints.',
  'auth/invalid-phone-number': 'Enter a valid phone number in international format, for example +919876543210.',
  'auth/invalid-verification-code': 'That verification code is incorrect. Check the latest SMS and try again.',
  'auth/code-expired': 'That verification code has expired. Request a new code and enter the newest SMS.',
  'auth/session-expired': 'This verification session expired. Request a new code and try again.',
  'auth/network-request-failed': 'Could not connect to Firebase. Check your internet connection and try again.',
  'auth/internal-error': 'Firebase could not send the verification SMS. Check that Phone sign-in, the SMS region, billing, and SMS quotas are configured for this project.',
};

export function normalizePhoneNumber(input: string, defaultCountryCode = '+91'): string | null {
  const value = input.trim();
  if (!value) return null;

  const international = value.startsWith('+') || value.startsWith('00');
  let digits = value.replace(/\D/g, '');
  if (value.startsWith('00')) digits = digits.slice(2);

  if (international) {
    return /^[1-9]\d{7,14}$/.test(digits) ? `+${digits}` : null;
  }

  if (defaultCountryCode === '+91' && digits.startsWith('0')) digits = digits.slice(1);
  if (defaultCountryCode === '+91' && digits.startsWith('91') && digits.length === 12) {
    return `+${digits}`;
  }
  if (defaultCountryCode === '+91' && digits.length === 10) return `+91${digits}`;

  return null;
}

export function phoneAuthErrorMessage(error: unknown): string {
  const code = typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code: unknown }).code)
    : '';
  if (PHONE_AUTH_ERRORS[code]) return PHONE_AUTH_ERRORS[code];
  if (error instanceof Error && error.message) return error.message;
  return 'Phone verification failed. Check your number and Firebase configuration, then try again.';
}
