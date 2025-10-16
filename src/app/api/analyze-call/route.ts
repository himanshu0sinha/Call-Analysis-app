import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

// Define evaluation parameters with their weights
const EVALUATION_PARAMETERS = {
  greeting: { weight: 5, type: "PASS_FAIL", desc: "Call opening within 5 seconds" },
  collectionUrgency: { weight: 15, type: "SCORE", desc: "Create urgency, cross-questioning" },
  rebuttalCustomerHandling: { weight: 15, type: "SCORE", desc: "Address penalties, objections" },
  callEtiquette: { weight: 15, type: "SCORE", desc: "Tone, empathy, clear speech" },
  callDisclaimer: { weight: 5, type: "PASS_FAIL", desc: "Take permission before ending" },
  correctDisposition: { weight: 10, type: "PASS_FAIL", desc: "Use correct category with remark" },
  callClosing: { weight: 5, type: "PASS_FAIL", desc: "Thank the customer properly" },
  fatalIdentification: { weight: 5, type: "PASS_FAIL", desc: "Missing agent/customer info" },
  fatalTapeDiscloser: { weight: 10, type: "PASS_FAIL", desc: "Inform customer about recording" },
  fatalToneLanguage: { weight: 15, type: "PASS_FAIL", desc: "No abusive or threatening speech" }
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("audio") as File;

    if (!file) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    // Check if Groq API key is configured
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "Groq API key not configured" },
        { status: 500 }
      );
    }

    try {
      // Step 1: Transcribe audio using Groq Whisper
      const transcription = await groq.audio.transcriptions.create({
        file: file,
        model: "whisper-large-v3",
      });

      console.log("Transcription:", transcription.text);

      // Step 2: Analyze transcription using Groq LLM
      const parametersList = Object.entries(EVALUATION_PARAMETERS)
        .map(([key, param]) => `        - ${key} (${param.type}, weight: ${param.weight}): ${param.desc}`)
        .join('\r\n');

      const analysisPrompt = `
        You are an expert call center quality analyst. Analyze this call recording transcription and evaluate it based on the following parameters:

        EVALUATION PARAMETERS:
${parametersList}

        SCORING RULES:
        - For PASS_FAIL parameters: Score is either 0 (fail) or the full weight value (pass)
        - For SCORE parameters: Score can be any number between 0 and the weight value

        TRANSCRIPTION:
        "${transcription.text}"

        Please provide your analysis in the following JSON format:
        {
          "scores": {
${Object.entries(EVALUATION_PARAMETERS).map(([key, param]) => {
            const range = param.type === 'PASS_FAIL' ? `<0 or ${param.weight}>` : `<0-${param.weight}>`;
            return `            "${key}": ${range}`;
          }).join(',\r\n')}
          },
          "overallFeedback": "<detailed feedback about the call performance>",
          "observation": "<specific observations about customer interactions, objections handled, etc.>"
        }

        Provide only the JSON response, no additional text.
      `;

      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are a professional call center quality analyst. Respond only with valid JSON.",
          },
          {
            role: "user",
            content: analysisPrompt,
          },
        ],
        temperature: 0.1,
      });

      const analysisResult = completion.choices[0].message.content;
      
      if (!analysisResult) {
        throw new Error("No analysis result received from Groq");
      }

      // Parse the JSON response
      let parsedResult;
      try {
        // Clean the response by removing markdown code blocks if present
        let cleanedResult = analysisResult.trim();
        if (cleanedResult.startsWith('```json')) {
          cleanedResult = cleanedResult.slice(7); // Remove ```json
        } else if (cleanedResult.startsWith('```')) {
          cleanedResult = cleanedResult.slice(3); // Remove ```
        }
        if (cleanedResult.endsWith('```')) {
          cleanedResult = cleanedResult.slice(0, -3); // Remove trailing ```
        }
        cleanedResult = cleanedResult.trim();
        
        parsedResult = JSON.parse(cleanedResult);
      } catch {
        console.error("Failed to parse AI response:", analysisResult);
        throw new Error("Failed to parse analysis result");
      }

      return NextResponse.json(parsedResult);

    } catch (error) {
      throw error;
    }

  } catch (error) {
    console.error("Error processing audio:", error);
    return NextResponse.json(
      { error: "Failed to process audio file" },
      { status: 500 }
    );
  }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
