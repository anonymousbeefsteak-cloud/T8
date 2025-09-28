import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { restaurantName, category } = req.query;

  if (!restaurantName || !category) {
    return res.status(400).json({ error: 'Restaurant name and category are required' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `請為一間名為 "${restaurantName}" 的「${category}」餐廳，生成一份包含6個品項的真實菜單。對於每個品項，請提供唯一的 ID、名稱和價格。每個品項都應包含餐廳名稱以供參考。請務必確保你的回覆只有一個符合下方 schema 的 JSON 物件，不要包含任何 markdown 標籤、註解或其他額外文字。`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            menu: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  price: { type: Type.NUMBER },
                  restaurantName: { type: Type.STRING, description: "此品項所屬的餐廳名稱。" }
                },
                required: ["id", "name", "price", "restaurantName"],
              },
            },
          },
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
        console.error(`為 ${restaurantName} 生成菜單時，從 Gemini 收到的原始文字:`, response.text);
        throw new Error("從 AI 服務收到的回應格式無效。");
    }
    
    res.status(200).json(json);

  } catch (error) {
    console.error(`為 ${restaurantName} 生成菜單時發生錯誤:`, error);
    const errorMessage = error instanceof Error ? error.message : "伺服器發生未知錯誤。";
    // Fallback data
    const fallbackMenus = {
      "現代美式料理": [
        { id: 'm1', name: "經典漢堡", price: 180, restaurantName }, { id: 'm2', name: "起司漢堡", price: 200, restaurantName }, { id: 'm3', name: "薯條", price: 80, restaurantName }, { id: 'm4', name: "奶昔", price: 120, restaurantName }, { id: 'm5', name: "洋蔥圈", price: 90, restaurantName }, { id: 'm6', name: "招牌沙拉", price: 150, restaurantName },
      ],
      "日式料理 & 壽司": [
        { id: 'm1', name: "綜合壽司拼盤", price: 320, restaurantName }, { id: 'm2', name: "鮭魚生魚片", price: 280, restaurantName }, { id: 'm3', name: "天婦羅烏龍麵", price: 220, restaurantName }, { id: 'm4', name: "照燒雞肉飯", price: 180, restaurantName }, { id: 'm5', name: "味噌湯", price: 60, restaurantName }, { id: 'm6', name: "日式煎餃", price: 120, restaurantName },
      ],
    };
    const menu = fallbackMenus[category as string] || fallbackMenus["現代美式料理"];
    res.status(500).json({ 
        error: `AI 服務錯誤: ${errorMessage}`, 
        menu 
    });
  }
}