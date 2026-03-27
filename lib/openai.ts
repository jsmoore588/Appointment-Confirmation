import { getAppSettings } from "@/lib/app-settings";

type ActionSummaryInput = {
  suggestions: string[];
  todayAppointments: Array<{
    name: string;
    vehicle: string;
    formattedTime: string;
    status: string;
    priority: string;
  }>;
  tomorrowAppointments: Array<{
    name: string;
    vehicle: string;
    formattedTime: string;
    status: string;
    priority: string;
  }>;
};

type ResponseOutput = {
  output?: Array<{
    type?: string;
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
};

function extractText(payload: ResponseOutput) {
  const parts =
    payload.output
      ?.flatMap((item) => item.content ?? [])
      .filter((item) => item.type === "output_text" && typeof item.text === "string")
      .map((item) => item.text as string) ?? [];

  return parts.join("\n").trim();
}

export async function generateActionSummary(input: ActionSummaryInput) {
  const settings = await getAppSettings();

  if (!settings.openaiApiKey) {
    return null;
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${settings.openaiApiKey}`
    },
    body: JSON.stringify({
      model: settings.openaiModel || "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text:
                "You are an operations assistant for appointment follow-up. Summarize the most important actions in 3 short bullets. Keep the tone direct and practical."
            }
          ]
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: JSON.stringify(input)
            }
          ]
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error("OpenAI request failed");
  }

  const payload = (await response.json()) as ResponseOutput;
  return extractText(payload);
}
