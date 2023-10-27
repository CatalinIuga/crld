import { parse } from "https://deno.land/std@0.204.0/flags/mod.ts";

type options = {
  X: string;
  url: string;
  H?: string;
  d?: string;
  i: boolean;
  json: boolean;
  form: boolean;
  include: boolean;
  v: boolean;
  _: string[];
};

export function parseArgs(args: string[]): options {
  return parse(args, {
    string: ["X", "H", "d", "url"],
    boolean: ["i", "json", "form", "include", "v"],
    alias: { method: "X", header: "H", data: "d" },
    default: {
      X: "GET",
      i: false,
      json: false,
      form: false,
      include: false,
      v: false,
    },
  });
}

console.log(parseArgs(Deno.args));
