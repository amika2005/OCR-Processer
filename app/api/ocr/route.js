import { NextResponse } from 'next/server';

// IMPORTANT: maxDuration does NOT work on Edge runtime. It only works on Node.js serverless on Pro plan.
// On Edge runtime (Hobby plan), Vercel kills the function after ~30 seconds of execution.
// The ONLY way to bypass this is to return a Response IMMEDIATELY (within 1 second)
// and then stream data asynchronously using a ReadableStream.
// DO NOT revert this to a simple `await fetch()` — it WILL cause 504 errors.
export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function POST(req) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL or base64 data is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key is not configured' }, { status: 500 });
    }

    // === CRITICAL: Return a Response IMMEDIATELY to avoid Vercel's 30s execution timeout ===
    // The ReadableStream lets us return HTTP 200 within milliseconds.
    // While Gemini is processing (which takes 15-60+ seconds), we send periodic
    // keep-alive pings to prevent Vercel's proxy from closing the connection.
    // Once Gemini starts responding, we pipe its stream data directly to the client.
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Send a large padded ping IMMEDIATELY to flush Vercel's internal proxy buffers
        controller.enqueue(encoder.encode(": keep-alive-" + "X".repeat(2048) + "\n\n"));

        // Continue pinging every 3 seconds to prevent idle timeout
        const pingInterval = setInterval(() => {
          try {
            controller.enqueue(encoder.encode(": keep-alive-" + "X".repeat(2048) + "\n\n"));
          } catch (e) {
            clearInterval(pingInterval);
          }
        }, 3000);

        try {
          const geminiResponse = await fetch("https://automation.sonasu.jp/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: "gemini-2.5-flash",
              temperature: 0.1,
              response_format: { type: "json_object" },
              stream: true,
              messages: [
                {
                  role: "user",
                  content: [
                    {
                      type: "text",
                      text: 'You are a professional OCR system for a Japanese client. Extract ALL text from this document accurately in its original language. Preserve formatting, lists, and structure. Then, translate the extracted text to Japanese. If there are tables in the document, extract them into an array of objects. CRITICAL: You MUST use the EXTREMELY EXACT column headers visually present in the document itself as the JSON keys (e.g., if the document header says "Start Date", use exactly "Start Date" as the key, with spaces included!). DO NOT use generic keys like "Column1". DO NOT camelCase the keys. CRITICAL RULE: If a table is split into multiple parts, DO NOT hallucinate, carry over, or inherit column headers (like "Product Name", "Term", "Net Price") from previous tables unless they are physically printed above the current cells. Output ONLY a valid JSON object matching exactly this structure: { "extractedText": "original text here", "translatedText": "translated text here", "tableData": [{"Genuine Header 1": "Value1", "Genuine Header 2": "Value2"}] }. If no tables exist, return an empty array for tableData. Do not output anything else. No markdown wrappers.',
                    },
                    {
                      type: "image_url",
                      image_url: {
                        url: imageUrl,
                      },
                    },
                  ],
                },
              ],
            }),
          });

          // Stop pinging once Gemini starts responding
          clearInterval(pingInterval);

          if (!geminiResponse.ok) {
            const errText = await geminiResponse.text();
            controller.enqueue(encoder.encode(`data: {"error":"Downstream API Error: ${geminiResponse.status} - ${errText}"}\n\n`));
            controller.close();
            return;
          }

          // Pipe Gemini's stream directly to the client
          const reader = geminiResponse.body.getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }
          controller.close();
        } catch (err) {
          clearInterval(pingInterval);
          controller.enqueue(encoder.encode(`data: {"error":"${err.message}"}\n\n`));
          controller.close();
        }
      }
    });

    // This Response is returned IMMEDIATELY (within milliseconds)
    // The stream continues running in the background
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error("OCR API Route Error:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
