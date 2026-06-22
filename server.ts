import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// Ensure process.env is populated (dotenv is pre-loaded by tsx, or we load it here manually to be absolutely safe)
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with named parameters as per the gemini-api skill instructions
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// AI Traffic assistant API Route
app.post("/api/gemini/assistant", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      res.status(400).json({ error: "Missing message parameter." });
      return;
    }

    const systemInstruction = `
Bạn là "COPPY" - Trợ lý Lái xe An toàn & Luật Giao thông Thông minh tại Việt Nam.
Giao diện của bạn được tích hợp trên HUD (Heads-Up Display) phản chiếu kính lái oto hoặc camera giao thông đô thị.
Nhiệm vụ của bạn:
1. Giải đáp thắc mắc về Luật Giao thông Đường bộ Việt Nam mới nhất, bao gồm mức phạt vi phạm (ví dụ: quá tốc độ, đi ngược chiều, không xi nhan, sai làn).
2. Tư vấn an toàn, kỹ năng lái xe phòng vệ, giải thích cặn kẽ ý nghĩa của biển báo đường bộ (Cấm, Nguy hiểm, Chỉ dẫn, Hiệu lệnh).
3. Đưa ra câu trả lời cực kỳ ngắn gọn, dễ hiểu, xúc tích nhưng vẫn đầy đủ, thân thiện, mang phong cách 'cool ngầu', am hiểu công nghệ giao thông thông minh.
4. Tránh viết những đoạn văn quá dài dòng vì người lái xe cần nắm bắt thông tin nhanh chóng. Ưu tiên viết theo dạng danh sách gạch đầu dòng ngắn hoặc câu ngắn gọn.
`;

    // Reconstruct history structure for chat safely
    const formattedContents = [];
    if (history && Array.isArray(history)) {
      for (const turn of history) {
        formattedContents.push({
          role: turn.role === "user" ? "user" : "model",
          parts: [{ text: turn.text }]
        });
      }
    }
    // Add current message
    formattedContents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.8,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ 
      error: "Đã xảy ra lỗi khi kết nối với máy chủ AI. Vui lòng kiểm tra cấu hình Secrets.", 
      details: error.message 
    });
  }
});

// Configure Vite or Static Assets serving based on the environment
async function initServer() {
  // Phục vụ file âm thanh cảnh báo tĩnh (phải đặt TRƯỚC Vite middleware)
  app.use("/audio", express.static(path.join(process.cwd(), "audio")));
  // Phục vụ ảnh biển báo tham khảo
  app.use("/reference", express.static(path.join(process.cwd(), "reference")));

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[DRIVER-HUD] Server ready at http://localhost:${PORT}`);
  });
}

initServer().catch((err) => {
  console.error("Failed to start server:", err);
});
