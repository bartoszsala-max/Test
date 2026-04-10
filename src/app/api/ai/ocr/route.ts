import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const bookId = formData.get("bookId") as string | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const fileName = `${user.id}/${bookId}/${Date.now()}-${file.name}`;

  const { data: uploadData, error: uploadError } = await supabase.storage.from("book-photos").upload(fileName, buffer, { contentType: file.type });
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data: { publicUrl } } = supabase.storage.from("book-photos").getPublicUrl(uploadData.path);

  const base64 = buffer.toString("base64");
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    messages: [{ role: "user", content: [{ type: "image", source: { type: "base64", media_type: file.type as "image/jpeg" | "image/png" | "image/gif" | "image/webp", data: base64 } }, { type: "text", text: "Please transcribe all the text visible in this book page image. Output only the transcribed text, preserving paragraph structure. Do not add any commentary." }] }],
  });

  const extractedText = message.content.filter((b) => b.type === "text").map((b) => (b as { type: "text"; text: string }).text).join("");

  const { data: excerpt, error: excerptError } = await supabase.from("excerpts").insert({ book_id: bookId, text: extractedText, photo_url: publicUrl }).select().single();
  if (excerptError) return NextResponse.json({ error: excerptError.message }, { status: 500 });

  return NextResponse.json({ excerpt, photoUrl: publicUrl, text: extractedText });
}
