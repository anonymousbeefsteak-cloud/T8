import { GoogleGenAI, Type } from "@google/genai";

// This is a Vercel serverless function
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "請為一個美食外送 App 生成一個包含8家多樣化且吸引人的虛構餐廳列表。請以繁體中文提供詳細資訊，例如：唯一的ID、名稱、類別、評分(介於3.5到5.0之間)、評論數、外送時間預估、最低訂單金額。此外，為每家餐廳提供一個簡短、描述性的英文圖片搜尋關鍵字 (imageSearchQuery)，例如 'gourmet burger and fries' 或 'fresh sushi platter'。請務必確保你的回覆只有一個符合下方 schema 的 JSON 物件，不要包含任何 markdown 標籤、註解或其他額外文字。",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            restaurants: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "餐廳的唯一識別碼。" },
                  name: { type: Type.STRING },
                  category: { type: Type.STRING },
                  rating: { type: Type.NUMBER },
                  reviews: { type: Type.INTEGER },
                  deliveryTime: { type: Type.STRING },
                  minOrder: { type: Type.INTEGER },
                  imageSearchQuery: { type: Type.STRING, description: "一個簡短、描述性的英文圖片搜尋關鍵字" },
                },
                required: ["id", "name", "category", "rating", "reviews", "deliveryTime", "minOrder", "imageSearchQuery"],
              },
            },
          },
        },
      },
    });

    let json;
    try {
      const rawText = response.text.trim();
      // Find the start and end of the JSON object. This is more robust than a simple regex.
      const startIndex = rawText.indexOf('{');
      const endIndex = rawText.lastIndexOf('}');
      if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
        throw new Error("回應中找不到有效的 JSON 物件。");
      }
      const jsonString = rawText.substring(startIndex, endIndex + 1);
      json = JSON.parse(jsonString);
    } catch (parseError) {
        console.error("JSON 解析失敗:", parseError);
        console.error("從 Gemini 收到的原始文字:", response.text);
        throw new Error("從 AI 服務收到的回應格式無效。");
    }
    
    // Enhance data with dynamic images, with fallbacks for robustness.
    const enhancedRestaurants = json.restaurants.map(restaurant => {
        const query = restaurant.imageSearchQuery || restaurant.category || restaurant.name;
        return {
            ...restaurant,
            image: `https://picsum.photos/seed/${encodeURIComponent(query)}/500/300`
        };
    });

    res.status(200).json({ restaurants: enhancedRestaurants });

  } catch (error) {
    console.error("生成餐廳資料時發生錯誤:", error);
    const errorMessage = error instanceof Error ? error.message : "伺服器發生未知錯誤。";
    // Fallback data
    const fallbackRestaurants = [
        { id: '1', name: "熾熱鐵板燒", category: "現代美式料理", rating: 4.7, reviews: 345, deliveryTime: "25-35 分鐘", minOrder: 150, image: "https://picsum.photos/seed/teppanyaki/500/300" },
        { id: '2', name: "京都花開壽司", category: "日式料理 & 壽司", rating: 4.9, reviews: 512, deliveryTime: "30-40 分鐘", minOrder: 200, image: "https://picsum.photos/seed/sushi/500/300" },
        { id: '3', name: "義大利麵萬歲", category: "義式料理 & 披薩", rating: 4.6, reviews: 420, deliveryTime: "20-30 分鐘", minOrder: 120, image: "https://picsum.photos/seed/pasta/500/300" },
    ];
    // Return a 500 status but still provide fallback data so the frontend can function.
    res.status(500).json({ 
        error: `AI 服務錯誤: ${errorMessage}`, 
        restaurants: fallbackRestaurants 
    });
  }
}