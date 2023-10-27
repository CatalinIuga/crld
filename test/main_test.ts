import { assertObjectMatch } from "https://deno.land/std@0.202.0/assert/mod.ts";
import { parseArgs } from "../src/main.ts";

/**
 * --url https://api.example.com/resource
 * -X POST --url https://api.example.com/resource -H "Content-Type: application/json" -d '{"key": "value"}' --json
 * --url https://api.example.com/resource -v
 * --url https://api.example.com/resource --include
 */

Deno.test("GET request test", () => {
  const args = parseArgs(["--url", "https://api.example.com/resource"]);

  const { _, ...parsedArgs } = args;

  assertObjectMatch(parsedArgs, {
    X: "GET",
    url: "https://api.example.com/resource",
    i: false,
    json: false,
    form: false,
    include: false,
    v: false,
  });
});

Deno.test("POST request test", () => {
  const args = parseArgs([
    "-X",
    "POST",
    "--url",
    "https://api.example.com/resource",
    "-H",
    "Content-Type: application/json",
    "-d",
    '{"key": "value"}',
    "--json",
  ]);
  const { _, ...parsedArgs } = args;
  assertObjectMatch(parsedArgs, {
    X: "POST",
    url: "https://api.example.com/resource",
    i: false,
    json: true,
    form: false,
    include: false,
    v: false,
    H: "Content-Type: application/json",
    d: '{"key": "value"}',
  });
});

Deno.test("GET request with verbose mode and include headers", () => {
  const args = parseArgs([
    "--url",
    "https://api.example.com/resource",
    "-v",
    "--include",
  ]);
  const { _, ...argsWithoutUnderscore } = args;

  assertObjectMatch(argsWithoutUnderscore, {
    X: "GET",
    url: "https://api.example.com/resource",
    i: false,
    json: false,
    form: false,
    include: true,
    v: true,
    H: undefined,
    d: undefined,
  });
});

Deno.test("Invalid input: no URL provided", () => {
  const args = parseArgs([]);
  assertObjectMatch(args, {
    X: "GET",
    url: undefined,
    i: false,
    json: false,
    form: false,
    include: false,
    v: false,
    H: undefined,
    d: undefined,
  });
});

Deno.test("Invalid input: unknown option", () => {
  const args = parseArgs([
    "--url",
    "https://api.example.com/resource",
    "--unknown",
  ]);
  const { _, ...argsWithoutUnderscore } = args;

  assertObjectMatch(argsWithoutUnderscore, {
    X: "GET",
    url: "https://api.example.com/resource",
    i: false,
    json: false,
    form: false,
    include: false,
    v: false,
    H: undefined,
    d: undefined,
  });
});

Deno.test("GET request with multiple headers", () => {
  const args = parseArgs([
    "--url",
    "https://api.example.com/resource",
    "-H",
    "Authorization: Bearer token",
    "-H",
    "Accept: application/json",
  ]);
  const { _, ...argsWithoutUnderscore } = args;

  assertObjectMatch(argsWithoutUnderscore, {
    X: "GET",
    url: "https://api.example.com/resource",
    i: false,
    json: false,
    form: false,
    include: false,
    v: false,
    H: "Authorization: Bearer token, Accept: application/json",
    d: undefined,
  });
});
