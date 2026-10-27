import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { issueCounselorToken, verifyCounselorToken, TOKEN_TTL_MS } from "./counselor-pin.server";

const PIN = "test-pin-9173";
const SECRET = "test-signing-secret-with-plenty-of-entropy-0123456789";

beforeEach(() => {
  process.env["DEMO_COUNSELOR_PIN"] = PIN;
  process.env["COUNSELOR_TOKEN_SECRET"] = SECRET;
});
afterEach(() => {
  delete process.env["DEMO_COUNSELOR_PIN"];
  delete process.env["COUNSELOR_TOKEN_SECRET"];
});

describe("counselor demo PIN gate", () => {
  it("issues a valid short-lived token for the correct PIN", () => {
    const issued = issueCounselorToken(PIN);
    expect(issued).not.toBeNull();
    expect(issued!.expiresAt).toBeGreaterThan(Date.now());
    expect(issued!.expiresAt).toBeLessThanOrEqual(Date.now() + TOKEN_TTL_MS);
    expect(verifyCounselorToken(issued!.token)).toBe(true);
  });
  it("rejects an incorrect PIN", () => {
    expect(issueCounselorToken("wrong-pin")).toBeNull();
    expect(issueCounselorToken("")).toBeNull();
  });
  it("fails closed when the PIN secret is not configured", () => {
    delete process.env["DEMO_COUNSELOR_PIN"];
    expect(issueCounselorToken(PIN)).toBeNull();
  });
  it("fails closed when the signing secret is not configured", () => {
    delete process.env["COUNSELOR_TOKEN_SECRET"];
    expect(issueCounselorToken(PIN)).toBeNull();
  });
  it("rejects missing, malformed and tampered tokens", () => {
    expect(verifyCounselorToken(null)).toBe(false);
    expect(verifyCounselorToken("")).toBe(false);
    expect(verifyCounselorToken("not-a-token")).toBe(false);
    const issued = issueCounselorToken(PIN)!;
    const [body, sig] = issued.token.split(".");
    expect(verifyCounselorToken(`${body}.${sig!.split("").reverse().join("")}`)).toBe(false);
    // Tampered payload (different expiry) must fail the signature check.
    const forged =
      Buffer.from(JSON.stringify({ scope: "counselor", exp: Date.now() + 99999999 })).toString(
        "base64url",
      ) + "." + sig;
    expect(verifyCounselorToken(forged)).toBe(false);
  });
  it("rejects an expired token", () => {
    const issued = issueCounselorToken(PIN)!;
    const realNow = Date.now;
    Date.now = () => realNow() + TOKEN_TTL_MS + 1000;
    try {
      expect(verifyCounselorToken(issued.token)).toBe(false);
    } finally {
      Date.now = realNow;
    }
  });
  it("rejects a token signed with a different secret", () => {
    const issued = issueCounselorToken(PIN)!;
    process.env["COUNSELOR_TOKEN_SECRET"] = "another-secret";
    expect(verifyCounselorToken(issued.token)).toBe(false);
  });
});
