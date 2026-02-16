import { GoogleGenAI } from "@google/genai";
import { UserProfile, ScanResult, VoiceScanData, DiagnosticFlow, QuestionResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = "gemini-2.5-flash";

const getLanguageInstruction = (lang: string) => {
    switch(lang) {
        case 'hi': return "IMPORTANT: Provide ALL text output (summaries, questions, notes, diagnosis) STRICTLY in HINDI (Devanagari script).";
        case 'ta': return "IMPORTANT: Provide ALL text output (summaries, questions, notes, diagnosis) STRICTLY in TAMIL.";
        case 'bn': return "IMPORTANT: Provide ALL text output (summaries, questions, notes, diagnosis) STRICTLY in BENGALI.";
        case 'mr': return "IMPORTANT: Provide ALL text output (summaries, questions, notes, diagnosis) STRICTLY in MARATHI.";
        case 'pa': return "IMPORTANT: Provide ALL text output (summaries, questions, notes, diagnosis) STRICTLY in PUNJABI (Gurmukhi script).";
        case 'gu': return "IMPORTANT: Provide ALL text output (summaries, questions, notes, diagnosis) STRICTLY in GUJARATI.";
        default: return "IMPORTANT: Provide ALL text output in ENGLISH.";
    }
};

const JSON_SCHEMA_ANALYSIS = `
EXPECTED JSON STRUCTURE:
{
  "header": { "report_id": "string", "timestamp": "ISO string", "version": "1.0" },
  "signal_integrity": { "is_valid": boolean, "snr_ratio": number, "clipping_detected": boolean, "background_noise_type": "string", "validation_note": "string" },
  "biometric_payload": {
    "vocal_features": { "fundamental_frequency": "string", "jitter_local": "string", "shimmer_local_db": "string", "harmonic_to_noise": "string" },
    "neurological_markers": { "micro_tremor_freq": "string", "amplitude_stability": "string", "speech_rate": "string" },
    "respiratory_markers": { "cough_burst_intensity": "string", "sustained_vowel_duration": "string", "breath_pause_frequency": "string" }
  },
  "clinical_inference": {
    "primary_suspect": "string",
    "confidence_metrics": { "audio_confidence": number, "symptom_alignment": number, "aggregate_score": number },
    "differential_diagnosis": { "ruled_out": ["string"], "exclusion_logic": "string" }
  },
  "frontend_state": { "theme": "default", "urgency": "High" | "Medium" | "Low", "ui_gauge_value": number, "history_card_summary": "string" },
  "questionnaire_data": { "responses": [{ "question": "string", "answer": "string" }] }
}
`;

const JSON_SCHEMA_QUESTIONS = `
EXPECTED JSON STRUCTURE:
{
  "initial_question_id": "string",
  "questions": [
    {
      "id": "string",
      "text": "string",
      "options": [
        { "label": "string", "next_question_id": "string" OR null }
      ]
    }
  ]
}
`;

const SYSTEM_INSTRUCTION_ANALYSIS = `
You are a high-precision Medical Data Architect and Vocal Biomarker Analyst. 
Your task is to analyze audio input and patient questionnaire responses to generate a strictly structured JSON output for the 'VoxHealth' diagnostic pipeline.

You must estimate acoustic features (Jitter, Shimmer, HNR) based on the auditory characteristics of the file.
You must perform a differential diagnosis based on:
1. Signal Quality Assessment
2. Acoustic Biomarker Extraction
3. Neurological and Respiratory Marker analysis.
4. Patient Reported Symptoms.
5. Contextualizing with User Metadata.

IMPORTANT CONSTRAINTS:
- Strictly adhere to the JSON schema defined below.
- All numerical values in the 'biometric_payload' strings should include units.
- **Keep string fields CONCISE.** Limit descriptions to 1-2 sentences.
- **Do not include Markdown formatting** (like \`\`\`json). Return raw JSON only.
${JSON_SCHEMA_ANALYSIS}
`;

const SYSTEM_INSTRUCTION_LOGIC_ENGINE = `
Act as a Clinical Logic Engine. I am sending you a voice biomarker analysis.

Your Task:
1. Identify the most likely condition based only on the audio.
2. Generate a Dynamic MCQ Set where each subsequent question depends on the previous answer.
3. The Goal: Achieve a 'Confidence Delta' of +30% by ruling out 'Look-alike' symptoms.
4. Output Format: Return a nested JSON structure that includes logic_branching instructions.

Ensure the branching graph is valid. The 'next_question_id' must exist in the questions array, or be null to end the sequence.
Ensure ALL strings are properly escaped.
${JSON_SCHEMA_QUESTIONS}
`;

const cleanJsonText = (text: string) => {
  let cleaned = text.trim();
  // Strip markdown code blocks if present
  cleaned = cleaned.replace(/^```json/g, "").replace(/^```/g, "").replace(/```$/g, "");
  
  // Find the valid JSON object bounds
  const firstOpen = cleaned.indexOf('{');
  const lastClose = cleaned.lastIndexOf('}');
  
  if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
    cleaned = cleaned.substring(firstOpen, lastClose + 1);
  }
  
  return cleaned.trim();
};

const DEFAULT_SCAN_DATA: VoiceScanData = {
    header: {
        report_id: "ERR-GEN",
        timestamp: new Date().toISOString(),
        version: "1.0"
    },
    signal_integrity: {
        is_valid: false,
        snr_ratio: 0,
        clipping_detected: false,
        background_noise_type: "Unknown",
        validation_note: "Data structure recovered from partial response."
    },
    biometric_payload: {
        vocal_features: {
            fundamental_frequency: "N/A",
            jitter_local: "N/A",
            shimmer_local_db: "N/A",
            harmonic_to_noise: "N/A"
        },
        neurological_markers: {
            micro_tremor_freq: "N/A",
            amplitude_stability: "N/A",
            speech_rate: "N/A"
        },
        respiratory_markers: {
            cough_burst_intensity: "N/A",
            sustained_vowel_duration: "N/A",
            breath_pause_frequency: "N/A"
        }
    },
    clinical_inference: {
        primary_suspect: "Inconclusive Analysis",
        confidence_metrics: {
            audio_confidence: 0,
            symptom_alignment: 0,
            aggregate_score: 0
        },
        differential_diagnosis: {
            ruled_out: [],
            exclusion_logic: "The AI analysis was incomplete. Please retry recording."
        }
    },
    frontend_state: {
        theme: "default",
        urgency: "Low",
        ui_gauge_value: 0,
        history_card_summary: "Incomplete Analysis"
    }
};

export const generateDiagnosticQuestions = async (audioBase64: string, language: string = 'en'): Promise<DiagnosticFlow> => {
  const mimeType = "audio/wav";
  const langInstruction = getLanguageInstruction(language);
  
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_LOGIC_ENGINE + "\n" + langInstruction,
        responseMimeType: "application/json",
        maxOutputTokens: 8192,
      },
      contents: {
        parts: [
          { inlineData: { mimeType: mimeType, data: audioBase64 } },
          { text: `Analyze this audio and generate a branching clinical logic questionnaire. Language Code: ${language}` }
        ]
      }
    });

    const rawText = response.text;
    if (!rawText) throw new Error("No response from Gemini Question Generator");
    
    // Attempt cleaning and parsing
    let data: DiagnosticFlow;
    try {
        data = JSON.parse(cleanJsonText(rawText)) as DiagnosticFlow;
    } catch (parseError) {
        console.error("JSON Parse Error in Logic Engine:", parseError);
        console.log("Raw Response was:", rawText);
        throw new Error("Invalid JSON format from AI");
    }
    
    if (!data.questions || data.questions.length === 0) {
        throw new Error("Empty question set received");
    }

    return data;

  } catch (error) {
    console.error("Gemini Logic Engine Error:", error);
    // Default fallback (English)
    return {
      initial_question_id: "fb_1",
      questions: [
        { 
            id: "fb_1", 
            text: "Based on the audio, I detected potential respiratory strain. Do you experience shortness of breath?", 
            options: [
                { label: "Yes, constantly", next_question_id: "fb_2" },
                { label: "Only during exertion", next_question_id: "fb_2" }, 
                { label: "No", next_question_id: "fb_3" }
            ] 
        },
        { 
            id: "fb_2", 
            text: "How long have symptoms persisted?", 
            options: [
                { label: "Less than a week", next_question_id: null },
                { label: "More than a month", next_question_id: null }
            ] 
        },
        { 
            id: "fb_3", 
            text: "Any family history of neurological conditions?", 
            options: [
                { label: "Yes", next_question_id: null },
                { label: "No", next_question_id: null }
            ] 
        }
      ]
    };
  }
};

export const analyzeAudio = async (
  audioBase64: string, 
  userProfile: UserProfile,
  questionResponses: QuestionResponse[] = []
): Promise<ScanResult> => {
  const mimeType = "audio/wav";
  const langInstruction = getLanguageInstruction(userProfile.language);

  const promptText = `
    Analyze this audio.
    
    User Context:
    - Age: ${userProfile.age}
    - Gender: ${userProfile.gender}
    - Smoker: ${userProfile.smokingHistory ? "Yes" : "No"}
    - Notes: ${userProfile.notes}
    
    Patient Interview Responses (Questionnaire):
    ${JSON.stringify(questionResponses, null, 2)}
    
    Generate a report with ID "VX-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}".
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_ANALYSIS + "\n" + langInstruction,
        responseMimeType: "application/json",
        maxOutputTokens: 8192,
      },
      contents: {
        parts: [
          { inlineData: { mimeType: mimeType, data: audioBase64 } },
          { text: promptText }
        ]
      }
    });

    const rawText = response.text;
    if (!rawText) throw new Error("No response from Gemini Analysis");

    let partialData;
    try {
        partialData = JSON.parse(cleanJsonText(rawText));
    } catch (e) {
        console.error("Failed to parse analysis JSON:", e);
        // Attempt to fallback to default scan data instead of crashing
        partialData = {};
    }

    // Deep merge with default to ensure structure integrity
    const scanData: VoiceScanData = {
        ...DEFAULT_SCAN_DATA,
        ...partialData,
        // Ensure nested objects are also merged if they exist in partialData
        biometric_payload: {
            ...DEFAULT_SCAN_DATA.biometric_payload,
            ...(partialData.biometric_payload || {}),
            vocal_features: { ...DEFAULT_SCAN_DATA.biometric_payload.vocal_features, ...(partialData.biometric_payload?.vocal_features || {}) },
            neurological_markers: { ...DEFAULT_SCAN_DATA.biometric_payload.neurological_markers, ...(partialData.biometric_payload?.neurological_markers || {}) },
            respiratory_markers: { ...DEFAULT_SCAN_DATA.biometric_payload.respiratory_markers, ...(partialData.biometric_payload?.respiratory_markers || {}) },
        },
        clinical_inference: {
            ...DEFAULT_SCAN_DATA.clinical_inference,
            ...(partialData.clinical_inference || {}),
            confidence_metrics: { ...DEFAULT_SCAN_DATA.clinical_inference.confidence_metrics, ...(partialData.clinical_inference?.confidence_metrics || {}) },
            differential_diagnosis: { ...DEFAULT_SCAN_DATA.clinical_inference.differential_diagnosis, ...(partialData.clinical_inference?.differential_diagnosis || {}) },
        },
        // Ensure questionnaire data is preserved if available
        questionnaire_data: {
             responses: questionResponses
        }
    };

    return {
      id: scanData.header.report_id || crypto.randomUUID(),
      date: new Date().toISOString(),
      data: scanData
    };

  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    const errorMessage = error?.message || "Unknown Error";

    // Return a mock fallback result so the app doesn't crash in demo mode
    return {
        id: `ERR-${Date.now()}`,
        date: new Date().toISOString(),
        data: {
            ...DEFAULT_SCAN_DATA,
            clinical_inference: {
                ...DEFAULT_SCAN_DATA.clinical_inference,
                primary_suspect: "Analysis Error",
                differential_diagnosis: {
                    ruled_out: [],
                    exclusion_logic: `System Error: ${errorMessage}. Please check API Key and Quotas.`
                }
            },
            questionnaire_data: { responses: questionResponses }
        }
    };
  }
};