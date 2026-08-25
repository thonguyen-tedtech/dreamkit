import { describe, expect, it } from "vitest";
import { isValid, validateLogin, type LoginValues } from "./auth-validation";

const validLogin: LoginValues = {
  email: "user@dreamkit.vn",
  password: "secret123",
};

describe("validateLogin", () => {
  it("passes with an email and password", () => {
    expect(isValid(validateLogin(validLogin))).toBe(true);
  });

  it("flags empty email and password", () => {
    const errors = validateLogin({ email: "  ", password: "" });
    expect(errors.email).toBeDefined();
    expect(errors.password).toBeDefined();
  });

  it("rejects an invalid email", () => {
    const errors = validateLogin({ ...validLogin, email: "not-an-email" });
    expect(errors.email).toBeDefined();
  });
});
