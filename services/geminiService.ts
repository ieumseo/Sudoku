import { GoogleGenAI } from "@google/genai";
import { BoardState } from "../types";

const getSystemInstruction = () => `
You are a sophisticated and polite Sudoku assistant.
Your goal is to provide a clean, concise hint for the user's current Sudoku game.

Analyze the board provided. The board is a 9x9 grid where 0 represents an empty cell.
Identify the logical next step. Do NOT just give the answer directly unless it's the only option.
Explain the logic briefly (e.g., "Row 3 requires a 5, and looking at columns...").
Keep the hint very short (max 2 sentences).
Tone: Professional, encouraging, minimal.
Language: Korean.
`;

export const getSmartHint = async (board: BoardState): Promise<string> => {
  if (!process.env.API_KEY) {
    console.error("API Key not found");
    return "API Key 설정이 필요합니다.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Construct a simple string representation of the board for the AI
    // Only send values, using 0 for empty
    const simpleBoard = board.map(row => row.map(cell => cell.value));
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Current Board State:\n${JSON.stringify(simpleBoard)}\n\nWhere should I look next?`,
      config: {
        systemInstruction: getSystemInstruction(),
        temperature: 0.2,
      }
    });

    return response.text || "힌트를 찾을 수 없습니다.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "통신 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
  }
};