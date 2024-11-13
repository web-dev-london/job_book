import OpenAI from 'openai';

const openai = new OpenAI({
  organization: process.env.OPENAI_ORG_ID,
  project: process.env.OPENAI_PROJECT_ID,
  apiKey: process.env.OPENAI_API_KEY
});

interface OutputFormat {
  [key: string]: string | string[] | OutputFormat;
}

export async function strict_output(
  system_prompt: string,
  user_prompt: string | string[],
  output_format: OutputFormat,
  default_category: string = "",
  output_value_only: boolean = false,
  model: string = "gpt-3.5-turbo-0125",
  temperature: number = 1,
  num_tries: number = 3,
  verbose: boolean = false,
  // amount: number,
): Promise<unknown> {
  const list_input: boolean = Array.isArray(user_prompt);
  const dynamic_elements: boolean = JSON.stringify(output_format).includes("<") && JSON.stringify(output_format).includes(">");
  const list_output: boolean = JSON.stringify(output_format).includes("[") && JSON.stringify(output_format).includes("]");

  let error_msg: string = "";

  for (let i = 0; i < num_tries; i++) {
    let output_format_prompt: string = `\nYou are to output the following in json format: ${JSON.stringify(
      output_format
    )}. Do not put quotation marks or escape character \\ in the output fields.`;

    if (list_output) {
      output_format_prompt += `\nIf output field is a list, classify output into the best element of the list.`;
    }

    if (dynamic_elements) {
      output_format_prompt += `\nAny text enclosed by < and > indicates you must generate content to replace it. Example input: Go to <location>, Example output: Go to the garden\nAny output key containing < and > indicates you must generate the key name to replace it.`;
    }

    if (list_input) {
      output_format_prompt += `\nGenerate a list of json, one json for each input element.`;
    }

    const response = await openai.chat.completions.create({
      temperature: temperature,
      model: model,
      messages: [
        {
          role: "system",
          content: system_prompt + output_format_prompt + error_msg,
        },
        { role: "user", content: Array.isArray(user_prompt) ? user_prompt.join("\n") : user_prompt },
      ],
    });

    const res: string = response.choices[0]?.message?.content ?? "";

    if (verbose) {
      console.log("System prompt:", system_prompt + output_format_prompt + error_msg);
      console.log("\nUser prompt:", user_prompt);
      console.log("\nGPT response:", res);
    }

    try {
      let output = JSON.parse(res);

      if (list_input) {
        if (!Array.isArray(output)) {
          throw new Error("Output format not in a list of json");
        }

        // Check if the output array length matches the expected amount
        // if (output.length !== amount) {
        //   throw new Error(`Expected ${amount} items, but received ${output.length}`);
        // }
      } else {
        output = [output];
      }

      // check for each element in the output_list, the format is correctly adhered to
      for (let index = 0; index < output.length; index++) {
        for (const key in output_format) {
          // unable to ensure accuracy of dynamic output header, so skip it
          if (/<.*?>/.test(key)) {
            continue;
          }

          // if output field missing, raise an error
          if (!(key in output[index])) {
            throw new Error(`${key} not in json output`);
          }

          // check that one of the choices given for the list of words is an unknown
          if (Array.isArray(output_format[key])) {
            const choices = output_format[key] as string[];
            // ensure output is not a list
            if (Array.isArray(output[index][key])) {
              output[index][key] = output[index][key][0];
            }
            // output the default category (if any) if GPT is unable to identify the category
            if (!choices.includes(output[index][key]) && default_category) {
              output[index][key] = default_category;
            }
            // if the output is a description format, get only the label
            if (output[index][key].includes(":")) {
              output[index][key] = output[index][key].split(":")[0];
            }
          }
        }

        // if we just want the values for the outputs
        if (output_value_only) {
          output[index] = Object.values(output[index]);
          // just output without the list if there is only one element
          if (output[index].length === 1) {
            output[index] = output[index][0];
          }
        }
      }

      return list_input ? output : output[0];
    } catch (e: unknown) {
      const error = e as Error;
      error_msg = `\n\nResult: ${res}\n\nError message: ${error.message}`;
      console.log("An exception occurred:", error.message);
      console.log("Current invalid JSON format:", res);
    }
  }

  return [];
};

