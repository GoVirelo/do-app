import { TOTP, generateSecret, generateURI, NobleCryptoPlugin, ScureBase32Plugin } from "otplib";

function makeTOTP(secret: string) {
  return new TOTP({
    crypto: new NobleCryptoPlugin(),
    base32: new ScureBase32Plugin(),
    secret,
  } as any);
}

export { generateSecret };

export function createTOTPUri(accountName: string, issuer: string, secret: string) {
  return generateURI({ label: accountName, issuer, secret } as any);
}

export async function verifyTOTP(token: string, secret: string): Promise<boolean> {
  const totp = makeTOTP(secret);
  const result = await totp.verify(token);
  if (typeof result === "boolean") return result;
  return result?.valid === true;
}
