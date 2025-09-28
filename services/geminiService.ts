import { GoogleGenAI, Type } from "@google/genai";
import { Restaurant, MenuItem, OrderDetails, CartItem } from '../types';

// This implementation makes calls directly to the Gemini API from the client-side.
// This resolves network errors when a backend is not available.

// IMPORTANT: In a production environment, you must secure this key.
// Here, we assume it's provided by the execution environment.
const API_KEY = process.env.GEMINI_API_KEY;

let ai;
if (API_KEY) {
    ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
    console.error("Gemini API key is not configured. The app will rely on fallback data.");
}


/**
 * A utility to safely parse a JSON string, which might be wrapped in markdown.
 * @param text The raw text response from the AI.
 * @returns The parsed JSON object.
 * @throws An error if parsing fails.
 */
function parseAiResponse(text: string): any {
    try {
        const rawText = text.trim();
        const startIndex = rawText.indexOf('{');
        const endIndex = rawText.lastIndexOf('}');
        if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
            throw new Error("回應中找不到有效的 JSON 物件。");
        }
        const jsonString = rawText.substring(startIndex, endIndex + 1);
        return JSON.parse(jsonString);
    } catch (parseError) {
        console.error("JSON 解析失敗:", parseError);
        console.error("從 Gemini 收到的原始文字:", text);
        throw new Error("從 AI 服務收到的回應格式無效。");
    }
}


export const fetchRestaurants = async (): Promise<Restaurant[]> => {
    if (!ai) {
        console.warn("AI service not available. Using fallback restaurant data.");
        // Return original fallback from the component
        return [
            { id: '1', name: "熾熱鐵板燒", category: "現代美式料理", rating: 4.7, reviews: 345, deliveryTime: "25-35 分鐘", minOrder: 150, image: "https://picsum.photos/seed/teppanyaki/500/300" },
            { id: '2', name: "京都花開壽司", category: "日式料理 & 壽司", rating: 4.9, reviews: 512, deliveryTime: "30-40 分鐘", minOrder: 200, image: "https://picsum.photos/seed/sushi/500/300" },
            { id: '3', name: "義大利麵萬歲", category: "義式料理 & 披薩", rating: 4.6, reviews: 420, deliveryTime: "20-30 分鐘", minOrder: 120, image: "https://picsum.photos/seed/pasta/500/300" },
            { id: '4', name: "塔可真好吃", category: "墨西哥料理 & 塔可", rating: 4.5, reviews: 288, deliveryTime: "15-25 分鐘", minOrder: 80, image: "https://picsum.photos/seed/taco/500/300" },
            { id: '5', name: "正宗川菜館", category: "中式料理", rating: 4.8, reviews: 389, deliveryTime: "30-40 分鐘", minOrder: 180, image: "https://picsum.photos/seed/sichuan-food/500/300" },
            { id: '6', name: "法式甜點屋", category: "甜點 & 蛋糕", rating: 4.9, reviews: 267, deliveryTime: "20-30 分鐘", minOrder: 100, image: "https://picsum.photos/seed/french-pastry/500/300" },
        ];
    }

    try {
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

        const json = parseAiResponse(response.text);
        if (!json.restaurants) {
            throw new Error("從 AI 服務收到的餐廳資料格式不正確");
        }
        
        // Enhance data with dynamic images
        const enhancedRestaurants = json.restaurants.map((restaurant: any) => {
            const query = restaurant.imageSearchQuery || restaurant.category || restaurant.name;
            return {
                ...restaurant,
                image: `https://picsum.photos/seed/${encodeURIComponent(query)}/500/300`
            };
        });

        return enhancedRestaurants;

    } catch (error) {
        console.error("獲取餐廳資料時發生錯誤:", error);
        // Fallback data for AI errors
        return [
            { id: '1', name: "熾熱鐵板燒", category: "現代美式料理", rating: 4.7, reviews: 345, deliveryTime: "25-35 分鐘", minOrder: 150, image: "https://picsum.photos/seed/teppanyaki/500/300" },
            { id: '2', name: "京都花開壽司", category: "日式料理 & 壽司", rating: 4.9, reviews: 512, deliveryTime: "30-40 分鐘", minOrder: 200, image: "https://picsum.photos/seed/sushi/500/300" },
            { id: '3', name: "義大利麵萬歲", category: "義式料理 & 披薩", rating: 4.6, reviews: 420, deliveryTime: "20-30 分鐘", minOrder: 120, image: "https://picsum.photos/seed/pasta/500/300" },
        ];
    }
};

export const fetchMenuForRestaurant = async (restaurantName: string, category: string): Promise<MenuItem[]> => {
     if (!ai) {
        console.warn("AI service not available. Using fallback menu data.");
        const fallbackMenus: { [key: string]: MenuItem[] } = {
          "現代美式料理": [
            { id: 'm1', name: "經典漢堡", price: 180, restaurantName }, { id: 'm2', name: "起司漢堡", price: 200, restaurantName }, { id: 'm3', name: "薯條", price: 80, restaurantName }, { id: 'm4', name: "奶昔", price: 120, restaurantName }, { id: 'm5', name: "洋蔥圈", price: 90, restaurantName }, { id: 'm6', name: "招牌沙拉", price: 150, restaurantName },
          ],
          "日式料理 & 壽司": [
            { id: 'm1', name: "綜合壽司拼盤", price: 320, restaurantName }, { id: 'm2', name: "鮭魚生魚片", price: 280, restaurantName }, { id: 'm3', name: "天婦羅烏龍麵", price: 220, restaurantName }, { id: 'm4', "name": "照燒雞肉飯", price: 180, restaurantName }, { id: 'm5', name: "味噌湯", price: 60, restaurantName }, { id: 'm6', name: "日式煎餃", price: 120, restaurantName },
          ],
           "義式料理 & 披薩": [
            { id: 'm1', name: "瑪格麗特披薩", price: 280, restaurantName }, { id: 'm2', name: "培根蛋奶義大利麵", price: 240, restaurantName }, { id: 'm3', name: "凱薩沙拉", price: 160, restaurantName }, { id: 'm4', name: "蒜香麵包", price: 80, restaurantName }, { id: 'm5', name: "提拉米蘇", price: 120, restaurantName }, { id: 'm6', name: "義式濃縮咖啡", price: 60, restaurantName },
          ],
          "墨西哥料理 & 塔可": [
            { id: 'm1', name: "牛肉塔可", price: 120, restaurantName }, { id: 'm2', name: "雞肉捲餅", price: 160, restaurantName }, { id: 'm3', name: "酪梨醬", price: 80, restaurantName }, { id: 'm4', name: "墨西哥玉米片", price: 100, restaurantName }, { id: 'm5', "name": "莎莎醬", price: 60, restaurantName }, { id: 'm6', name: "墨西哥汽水", price: 50, restaurantName },
          ]
        };
        return fallbackMenus[category] || fallbackMenus["現代美式料理"];
    }
    
    try {
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

        const json = parseAiResponse(response.text);
        if (!json.menu) {
            throw new Error("從 AI 服務收到的菜單資料格式不正確");
        }
        return json.menu;

    } catch (error) {
        console.error(`獲取 ${restaurantName} 菜單時發生錯誤:`, error);
        // Fallback data for AI errors
        const fallbackMenus: { [key: string]: MenuItem[] } = {
          "現代美式料理": [
            { id: 'm1', name: "經典漢堡", price: 180, restaurantName }, { id: 'm2', name: "起司漢堡", price: 200, restaurantName }, { id: 'm3', name: "薯條", price: 80, restaurantName }, { id: 'm4', name: "奶昔", price: 120, restaurantName }, { id: 'm5', name: "洋蔥圈", price: 90, restaurantName }, { id: 'm6', name: "招牌沙拉", price: 150, restaurantName },
          ],
          "日式料理 & 壽司": [
            { id: 'm1', name: "綜合壽司拼盤", price: 320, restaurantName }, { id: 'm2', name: "鮭魚生魚片", price: 280, restaurantName }, { id: 'm3', name: "天婦羅烏龍麵", price: 220, restaurantName }, { id: 'm4', "name": "照燒雞肉飯", price: 180, restaurantName }, { id: 'm5', name: "味噌湯", price: 60, restaurantName }, { id: 'm6', name: "日式煎餃", price: 120, restaurantName },
          ],
        };
        return fallbackMenus[category] || fallbackMenus["現代美式料理"];
    }
};

export const submitOrder = async (orderDetails: OrderDetails, cart: CartItem[]): Promise<{orderNumber: string, estimatedDeliveryTime: string}> => {
    if (!ai) {
        console.warn("AI service not available. Using fallback order confirmation.");
        return {
            orderNumber: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
            estimatedDeliveryTime: "20-30 分鐘",
        };
    }
    
    try {
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

        const json = parseAiResponse(response.text);
        if (!json.orderNumber || !json.estimatedDeliveryTime) {
             throw new Error("從 AI 服務收到的訂單資料格式不正確");
        }
        return { 
            orderNumber: json.orderNumber, 
            estimatedDeliveryTime: json.estimatedDeliveryTime 
        };

    } catch (error) {
        console.error("處理訂單時發生錯誤:", error);
        // Fallback data for AI errors
        return {
            orderNumber: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
            estimatedDeliveryTime: "20-30 分鐘",
        };
    }
};
