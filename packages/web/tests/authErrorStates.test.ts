import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import FormField from "../src/components/ui/FormField.js";
import {
  AUTH_COPY,
  authServerErrorMessage,
  isValidEmailFormat,
} from "../src/components/auth/authErrors.js";

test("auth email format validation trims input and rejects malformed addresses", () => {
  assert.equal(isValidEmailFormat(" user@example.com "), true);
  assert.equal(isValidEmailFormat("not-an-email"), false);
  assert.equal(isValidEmailFormat("missing-domain@"), false);
});

test("auth server error mapper uses safe copy for incorrect credentials", () => {
  assert.equal(
    authServerErrorMessage({ response: { data: { code: "AUTH_INVALID_CREDENTIALS" } } }, "fallback"),
    AUTH_COPY.incorrectCredentials,
  );
  assert.equal(
    authServerErrorMessage({ response: { data: { error: "Invalid email or password" } } }, "fallback"),
    AUTH_COPY.incorrectCredentials,
  );
  assert.equal(
    authServerErrorMessage({ response: { data: { error: "Email is already registered" } } }, "fallback"),
    "Email is already registered",
  );
});

test("FormField renders inline red errors next to the input", () => {
  const html = renderToStaticMarkup(
    React.createElement(FormField, { label: "Email", error: AUTH_COPY.invalidEmail },
      React.createElement("input", { type: "email" }),
    ),
  );

  assert.match(html, /Email/);
  assert.match(html, /role="alert"/);
  assert.match(html, /text-brutal-red/);
  assert.match(html, /Invalid email format/);
});
