import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { orderDetails, cart } = req.body;

  if (!orderDetails || !cart) {
    return res.status(400).json({ error: 'Order details and cart are required' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `一位顧客下了一張美食外送訂單。
    顧客資料: ${JSON.stringify(orderDetails)}。
    訂單品項: ${cart.map(item => `${item.name} x${item.quantity}`).join(', ')}。
    請根據這些資訊，生成一個唯一的訂單編號（格式：ORD-XXXXXX）和一個真實的預計送達時間（例如：25-35 分鐘）。請務必確保你的回覆只有一個符合下方 schema 的 JSON 物件，不要包含任何 markdown 標籤、註解或其他額外文字。`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            orderNumber: { type: Type.STRING },
            estimatedDeliveryTime: { type: Type.STRING },
          },
          required: ["orderNumber", "estimatedDeliveryTime"],
        },
      },
    });

    let json;
    try {
        const rawText = response.text.trim();
        const startIndex = rawText.indexOf('{');
        const endIndex = rawText.lastIndexOf('}');
        if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
            throw new Error("回應中找不到有效的 JSON 物件。");
        }
        const jsonString = rawText.substring(startIndex, endIndex + 1);
        json = JSON.parse(jsonString);
    } catch (parseError) {
        console.error("JSON 解析失敗:", parseError);
        console.error("處理訂單時，從 Gemini 收到的原始文字:", response.text);
        throw new Error("從 AI 服務收到的回應格式無效。");
    }

    res.status(200).json(json);

  } catch (error) {
    console.error("處理訂單時發生錯誤:", error);
    const errorMessage = error instanceof Error ? error.message : "伺服器發生未知錯誤。";
    // Fallback data
    const fallbackResponse = {
      orderNumber: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      estimatedDeliveryTime: "20-30 分鐘",
    };
    res.status(500).json({
        ...fallbackResponse,
        error: `AI 服務錯誤: ${errorMessage}`
    });
  }
}