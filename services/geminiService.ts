import { Restaurant, MenuItem, OrderDetails, CartItem } from '../types';

/**
 * 獲取餐廳列表。
 * 由於 API 金鑰已移除，此函式現在會回傳一個靜態的餐廳列表。
 * @returns A promise that resolves to an array of Restaurant objects.
 */
export const fetchRestaurants = async (): Promise<Restaurant[]> => {
    console.warn("使用靜態餐廳資料，因為 API 功能已停用。");
    // Fallback data is now the primary data source.
    return [
        { id: '1', name: "熾熱鐵板燒", category: "現代美式料理", rating: 4.7, reviews: 345, deliveryTime: "25-35 分鐘", minOrder: 150, image: "https://picsum.photos/seed/teppanyaki/500/300" },
        { id: '2', name: "京都花開壽司", category: "日式料理 & 壽司", rating: 4.9, reviews: 512, deliveryTime: "30-40 分鐘", minOrder: 200, image: "https://picsum.photos/seed/sushi/500/300" },
        { id: '3', name: "義大利麵萬歲", category: "義式料理 & 披薩", rating: 4.6, reviews: 420, deliveryTime: "20-30 分鐘", minOrder: 120, image: "https://picsum.photos/seed/pasta/500/300" },
        { id: '4', name: "塔可真好吃", category: "墨西哥料理 & 塔可", rating: 4.5, reviews: 288, deliveryTime: "15-25 分鐘", minOrder: 80, image: "https://picsum.photos/seed/taco/500/300" },
        { id: '5', name: "正宗川菜館", category: "中式料理", rating: 4.8, reviews: 389, deliveryTime: "30-40 分鐘", minOrder: 180, image: "https://picsum.photos/seed/sichuan-food/500/300" },
        { id: '6', name: "法式甜點屋", category: "甜點 & 蛋糕", rating: 4.9, reviews: 267, deliveryTime: "20-30 分鐘", minOrder: 100, image: "https://picsum.photos/seed/french-pastry/500/300" },
    ];
};

/**
 * 根據餐廳名稱和類別獲取菜單。
 * 由於 API 金鑰已移除，此函式現在會根據類別回傳一個靜態的菜單。
 * @param restaurantName - The name of the restaurant.
 * @param category - The category of the restaurant.
 * @returns A promise that resolves to an array of MenuItem objects.
 */
export const fetchMenuForRestaurant = async (restaurantName: string, category: string): Promise<MenuItem[]> => {
    console.warn("使用靜態菜單資料，因為 API 功能已停用。");
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
};

/**
 * 提交訂單。
 * 由於 API 金鑰已移除，此函式會在本機生成一個隨機的訂單編號和固定的預計送達時間。
 * @param orderDetails - The details of the order.
 * @param cart - The items in the cart.
 * @returns A promise that resolves to an object with an orderNumber and estimatedDeliveryTime.
 */
export const submitOrder = async (orderDetails: OrderDetails, cart: CartItem[]): Promise<{orderNumber: string, estimatedDeliveryTime: string}> => {
    console.warn("使用靜態訂單確認，因為 API 功能已停用。");
    // Generate a random order number locally.
    return {
        orderNumber: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
        estimatedDeliveryTime: "20-30 分鐘",
    };
};
