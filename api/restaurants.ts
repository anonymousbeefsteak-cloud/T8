// This is a Vercel serverless function
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // API key is removed, providing static fallback data directly.
  const fallbackRestaurants = [
    { id: '1', name: "熾熱鐵板燒", category: "現代美式料理", rating: 4.7, reviews: 345, deliveryTime: "25-35 分鐘", minOrder: 150, imageSearchQuery: "teppanyaki grill" },
    { id: '2', name: "京都花開壽司", category: "日式料理 & 壽司", rating: 4.9, reviews: 512, deliveryTime: "30-40 分鐘", minOrder: 200, imageSearchQuery: "fresh sushi platter" },
    { id: '3', name: "義大利麵萬歲", category: "義式料理 & 披薩", rating: 4.6, reviews: 420, deliveryTime: "20-30 分鐘", minOrder: 120, imageSearchQuery: "italian pasta pizza" },
    { id: '4', name: "塔可真好吃", category: "墨西哥料理 & 塔可", rating: 4.5, reviews: 288, deliveryTime: "15-25 分鐘", minOrder: 80, imageSearchQuery: "gourmet mexican tacos" },
    { id: '5', name: "正宗川菜館", category: "中式料理", rating: 4.8, reviews: 389, deliveryTime: "30-40 分鐘", minOrder: 180, imageSearchQuery: "sichuan chinese food" },
    { id: '6', name: "法式甜點屋", category: "甜點 & 蛋糕", rating: 4.9, reviews: 267, deliveryTime: "20-30 分鐘", minOrder: 100, imageSearchQuery: "elegant french pastry" },
  ];
  
  const enhancedRestaurants = fallbackRestaurants.map(restaurant => {
      const query = restaurant.imageSearchQuery || restaurant.category || restaurant.name;
      return {
          ...restaurant,
          image: `https://picsum.photos/seed/${encodeURIComponent(query)}/500/300`
      };
  });

  res.status(200).json({ restaurants: enhancedRestaurants });
}
