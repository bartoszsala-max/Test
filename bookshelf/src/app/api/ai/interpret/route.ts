import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  // Auth check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { excerptId, text, bookTitle, bookAuthors } = await req.json();
  if (!text) return new Response("No text provided", { status: 400 });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const aiStream = await client.messages.stream({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: `You are a literary scholar providing insightful analysis of book excerpts.

Book: "${bookTitle}" by ${bookAuthors}

Excerpt:
"${text}"

Please provide a rich literary interpretation covering:
- Thematic significance
- Literary devices or techniques used
- How it connects to broader themes in the work
- Why this passage might be memorable or important

Keep your response focused and engaging, around 150-250 words.`,
          },
        ],
      });

      let fullText = "";
      for await (const chunk of aiStream) {
        if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
          fullText += chunk.delta.text;
          controller.enqueue(encoder.encode(chunk.delta.text));
        }
      }

      // Save interpretation to DB
      if (excerptId) {
        await supabase
          .from("excerpts")
          .update({ ai_interpretation: fullText })
          .eq("id", excerptId);
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
