export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { orderDetails, cart } = req.body;

  if (!orderDetails || !cart) {
    return res.status(400).json({ error: 'Order details and cart are required' });
  }

  // API key is removed, providing a static fallback response with a random order number.
  const staticResponse = {
    orderNumber: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
    estimatedDeliveryTime: "20-30 分鐘",
  };
  
  res.status(200).json(staticResponse);
}
