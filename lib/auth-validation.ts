/**
 * Pure validation for the auth forms.
 *
 * Kept framework-agnostic (no React) so the rules are trivially unit-testable
 * and can be reused by a real backend/server action later.
 */

export interface LoginValues {
  email: string;
  password: string;
}

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLogin(values: LoginValues): FieldErrors<LoginValues> {
  const errors: FieldErrors<LoginValues> = {};

  if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = "Email không hợp lệ.";
  }
  if (!values.password) {
    errors.password = "Vui lòng nhập mật khẩu.";
  }

  return errors;
}

/** True when an error map has no entries. */
export function isValid<T>(errors: FieldErrors<T>): boolean {
  return Object.keys(errors).length === 0;
}
