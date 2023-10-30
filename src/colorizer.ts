type JSONValue = string | number | boolean | null | JSONObject | JSONArray;

type JSONArray = JSONValue[];

interface JSONObject {
  [x: string]: JSONValue;
}

/**
 * @description Color Options for the JSON highlighter. Only valid CSS colors will work. The color must be specified as a string, in any valid CSS way.
 * @example { booleans: "black", keys: "#252525", strings:"rgb(31 120 50)"}
 *  @default Defaults: {delimiters: "white", colons: "orange", keys: "FA9BFA", numbers: "red", strings: "green", booleans: "blue", nulls:"crimson"}
 * @property Delimiter {}[],
 * @property Colons :
 * @property Keys "key":
 * @property Numbers values
 * @property String values
 * @property Boolean values
 * @property Null values
 */
type ColorOptions = {
  delimiters?: string;
  colons?: string;
  keys?: string;
  numbers?: string;
  strings?: string;
  booleans?: string;
  nulls?: string;
};

/**
 * @param json The JSON Object to be parsed.
 * @param colorOptions ColorOptions object that can be modified to user preferences.
 * @description Takes in a JSON Object and prints to the standard output a highlited version of it.
 */
function printColoredJson(json: JSONObject, colorOptions?: ColorOptions): void {
  let jsonString = JSON.stringify(json, null, 4);

  const colors: Array<string> = [];

  const tokenTypes = [
    {
      regex: /[{},[\]]+(?=([^"]*"[^"]*")*[^"]*$)/g, // delimiters
      color: colorOptions?.delimiters || "white",
    },
    {
      regex: /[:]+(?=([^"]*"[^"]*")*[^"]*$)/g, // colons
      color: colorOptions?.colons || "orange",
    },
    {
      regex: /[0-9]+(?=([^"]*"[^"]*")*[^"]*$)/g, // numbers
      color: colorOptions?.numbers || "red",
    },
    {
      regex: /(\".*\")(?=(:|%c\w+:))/g, // keys
      color: colorOptions?.keys || "#FA9BFA",
    },
    {
      regex: /\s\".*"/gm, // string values
      color: colorOptions?.strings || "green",
    },
    {
      regex: /(true|false)((\n\s*)*%cwhite[,}(\n\s)\]])/g, // true/false
      color: colorOptions?.booleans || "blue",
    },
    {
      regex: /null((\n\s*)*%cwhite[,}(\n\s)\]])/g, // null
      color: colorOptions?.nulls || "crimson",
    },
  ];

  // before each tokken match we add a %c (which will format
  // the string later) and the color of choice.
  for (const token of tokenTypes) {
    const regex = new RegExp(token.regex.source, "g");
    jsonString = jsonString.replace(regex, (match) => {
      const replacement = `%c${token.color}${match}`;
      return replacement;
    });
  }

  // This matches the %c<color> in order to create out array of colors.
  const colorRegex = new RegExp(
    "%c(" + tokenTypes.map((t) => t.color).join("|") + ")",
    "g"
  );

  // at each match we add the color to the color array
  jsonString = jsonString.replace(colorRegex, (match) => {
    colors.push(`color: ${match.slice(2)};font-weight: 900;`);
    return "%c";
  });

  // preatty print the json with the colors of choice.
  console.log(jsonString, ...colors);
}

export { printColoredJson };
