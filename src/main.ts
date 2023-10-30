import { Command } from "https://deno.land/x/cliffy@v1.0.0-rc.3/command/mod.ts";
import { printColoredJson } from "./colorizer.ts";

// const HTTP_METHODS = ["GET", "PUT", "POST", "PATCH", "DELETE", "HEAD"];
/**
 * -b for reusing cookies
 */
const crld = new Command()
  .name("crld")
  .version("0.1.0")
  .description("Curl alternative written using Deno.")
  .arguments("<url:string> [options]")
  .option("--method, -X <method:string>", "HTTP method.")
  .option("--header, -H <header:string>", "HTTP headers.", {
    collect: true,
  })
  .option("--form, -F <data:string>", "Send forma data as key=value pairs.", {
    collect: true,
  })
  .option("--data, -d <data:string>", "Send data in the body of the request.", {
    collect: true,
  })
  .option("--cookie, -c <cookie:string>", "Sets cookies with the request.", {
    collect: true,
  })
  .option("-I, --head", "HTTP Head method (returns headers only).", {
    conflicts: ["-X"],
  })
  .option("-i, --inspect", "Show headers.")
  .option("--json", "Send data as JSON format", { conflicts: ["--form"] })
  .option("-L, --follow", "Follows HTTP redirects.")
  .action(async (options, args) => {
    const requestOptions: RequestInit = {
      method: options.method || "GET",
    };
    const requestHeaders = new Headers();

    if (options.header) {
      for (const header of options.header) {
        const [name, value] = header.split(":").map((str) => str.trim());
        requestHeaders.append(name, value);
      }
    }

    if (options.form) {
      requestOptions.body = new FormData();
      options.form.forEach((pair) => {
        const [key, value] = pair.split("=");
        (requestOptions.body as FormData).append(key, value);
      });
    } else if (options.data) {
      requestOptions.body = options.data.join("&");
    }

    if (options.cookie) {
      const cookieString = options.cookie
        .reduce((acc: string[], cookie) => acc.concat(cookie), [])
        .join("; ");
      requestHeaders.append("Cookie", cookieString);
    }

    if (options.head) {
      requestOptions.method = "HEAD";
    }

    if (options.json) {
      requestHeaders.set("Content-Type", "application/json");
      requestOptions.body = JSON.stringify(options.json);
    }

    if (options.follow) {
      requestOptions.redirect = "follow";
    }

    requestOptions.headers = requestHeaders;

    try {
      const response = await fetch(args, requestOptions);

      /**
       * Request status
       */
      let responseColor: string;
      if (response.status >= 200 && response.status < 300)
        responseColor = "color: green;";
      else if (response.status >= 400 && response.status < 500)
        responseColor = "color: red;";
      else if (response.status >= 500) responseColor = "color: crimson;";
      else responseColor = "color: white;";

      console.log(
        `%cSTATUS: %c${response.status + " " + response.statusText}`,
        "color: white;",
        responseColor
      );

      /**
       * Headers parsing and printing.
       */
      if (options.inspect || options.head) {
        for (const [key, value] of response.headers.entries()) {
          console.log(
            `%c${key
              .split("-")
              .map((e) => e.charAt(0).toUpperCase() + e.slice(1))
              .join("-")}: %c${value}`,
            "color: blue;",
            "color: white;"
          );
        }
      }

      // HEAD only returns headers.
      if (options.head) return;
      console.log();

      // Parsing and printing response body.
      const responseBody = await response.text();

      if (
        options.json ||
        response.headers.get("Content-Type")?.includes("application/json")
      ) {
        console.log(
          options.json,
          response.headers.get("Content-Type")?.includes("application/json")
        );

        return printColoredJson({ json: JSON.parse(responseBody) });
      }

      console.log(responseBody);
    } catch (error) {
      console.error("Error:", error.message);
    }
  });

await crld.parse(Deno.args);
