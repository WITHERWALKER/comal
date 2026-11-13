export function orderConfirmationPath(accessToken: string): string {
  return `/order/${accessToken}`;
}
