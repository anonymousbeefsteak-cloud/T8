export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { restaurantName, category } = req.query;

  if (!restaurantName || !category) {
    return res.status(400).json({ error: 'Restaurant name and category are required' });
  }
  
  // API key is removed, providing static fallback data directly.
  const fallbackMenus = {
    "現代美式料理": [
      { id: 'm1', name: "經典漢堡", price: 180, restaurantName }, { id: 'm2', name: "起司漢堡", price: 200, restaurantName }, { id: 'm3', name: "薯條", price: 80, restaurantName }, { id: 'm4', name: "奶昔", price: 120, restaurantName }, { id: 'm5', name: "洋蔥圈", price: 90, restaurantName }, { id: 'm6', name: "招牌沙拉", price: 150, restaurantName },
    ],
    "日式料理 & 壽司": [
      { id: 'm1', name: "綜合壽司拼盤", price: 320, restaurantName }, { id: 'm2', name: "鮭魚生魚片", price: 280, restaurantName }, { id: 'm3', name: "天婦羅烏龍麵", price: 220, restaurantName }, { id: 'm4', name: "照燒雞肉飯", price: 180, restaurantName }, { id: 'm5', name: "味噌湯", price: 60, restaurantName }, { id: 'm6', name: "日式煎餃", price: 120, restaurantName },
    ],
    "義式料理 & 披薩": [
        { id: 'm1', name: "瑪格麗特披薩", price: 280, restaurantName }, { id: 'm2', name: "培根蛋奶義大利麵", price: 240, restaurantName }, { id: 'm3', name: "凱薩沙拉", price: 160, restaurantName }, { id: 'm4', name: "蒜香麵包", price: 80, restaurantName }, { id: 'm5', name: "提拉米蘇", price: 120, restaurantName }, { id: 'm6', name: "義式濃縮咖啡", price: 60, restaurantName },
    ],
    "墨西哥料理 & 塔可": [
        { id: 'm1', name: "牛肉塔可", price: 120, restaurantName }, { id: 'm2', name: "雞肉捲餅", price: 160, restaurantName }, { id: 'm3', name: "酪梨醬", price: 80, restaurantName }, { id: 'm4', name: "墨西哥玉米片", price: 100, restaurantName }, { id: 'm5', "name": "莎莎醬", price: 60, restaurantName }, { id: 'm6', name: "墨西哥汽水", price: 50, restaurantName },
    ],
    "中式料理": [
        { id: 'm1', name: "麻婆豆腐", price: 180, restaurantName }, { id: 'm2', name: "宮保雞丁", price: 220, restaurantName }, { id: 'm3', name: "酸辣湯", price: 80, restaurantName }, { id: 'm4', name: "炒飯", price: 120, restaurantName }, { id: 'm5', name: "小籠包", price: 150, restaurantName }, { id: 'm6', name: "春捲", price: 90, restaurantName },
    ],
    "甜點 & 蛋糕": [
        { id: 'm1', name: "巧克力熔岩蛋糕", price: 150, restaurantName }, { id: 'm2', name: "草莓千層", price: 180, restaurantName }, { id: 'm3', name: "檸檬塔", price: 120, restaurantName }, { id: 'm4', name: "馬卡龍", price: 90, restaurantName }, { id: 'm5', name: "起司蛋糕", price: 130, restaurantName }, { id: 'm6', name: "冰淇淋", price: 70, restaurantName },
    ]
  };

  const menu = fallbackMenus[category as string] || fallbackMenus["現代美式料理"];
  res.status(200).json({ menu });
}
