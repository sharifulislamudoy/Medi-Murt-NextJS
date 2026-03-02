import { NextResponse } from "next/server";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function POST(req: Request) {
  try {
    const { name, category } = await req.json();

    if (!name || !category) {
      return NextResponse.json(
        { error: "Product name and category are required" },
        { status: 400 }
      );
    }

    const prompt = `Generate a short, informative description for a medicine/product called "${name}" in the category "${category}". Include its common uses and typical dosage information for different age groups (adults, children, elderly) if applicable. 
    
**Important:** Output only the description text itself. Do **not** include any introductory phrases like "Here is a short description" or repeat the product name. Just provide the description. Keep it concise, professional, and under 100 words.`;

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct", // or another current model
        messages: [
          {
            role: "system",
            content: "You are a helpful medical assistant that provides accurate and concise product descriptions. You always output only the description text without any additional commentary.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Groq API error:", error);
      return NextResponse.json(
        { error: "Failed to generate description" },
        { status: 500 }
      );
    }

    const data = await response.json();
    let description = data.choices[0]?.message?.content?.trim() || "";

    // Optional: Additional cleanup to remove any accidental prefixed text
    // This regex removes common introductory phrases if they appear
    description = description.replace(/^(Here('s| is) a (short )?description (for|of) .*?:\s*)/i, '').trim();

    return NextResponse.json({ description });
  } catch (error) {
    console.error("Generate description error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}