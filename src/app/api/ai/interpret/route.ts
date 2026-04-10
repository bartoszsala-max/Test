import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
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
        messages: [{ role: "user", content: `You are a literary scholar providing insightful analysis of book excerpts.\n\nBook: "${bookTitle}" by ${bookAuthors}\n\nExcerpt:\n"${text}"\n\nPlease provide a rich literary interpretation covering:\n- Thematic significance\n- Literary devices or techniques used\n- How it connects to broader themes in the work\n- Why this passage might be memorable or important\n\nKeep your response focused and engaging, around 150-250 words.` }],
      });
      let fullText = "";
      for await (const chunk of aiStream) {
        if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
          fullText += chunk.delta.text;
          controller.enqueue(encoder.encode(chunk.delta.text));
        }
      }
      if (excerptId) { await supabase.from("excerpts").update({ ai_interpretation: fullText }).eq("id", excerptId); }
      controller.close();
    },
  });
  return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8", "Transfer-Encoding": "chunked" } });
}
