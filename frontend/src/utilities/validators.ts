export function isValidEmail(email: string | undefined | null): boolean {
  const emailRegex = /^\S+@\S+\.\S+$/;
  return email ? emailRegex.test(email) : false;
}
