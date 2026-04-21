import { db } from '@/lib/db';

async function seedProducts() {
  const products = [
    {
      title: 'Wireless Bluetooth Headphones Pro - Active Noise Cancellation',
      description: 'Premium wireless headphones with 40-hour battery life, active noise cancellation, and crystal-clear sound quality. Perfect for music lovers and professionals.',
      images: JSON.stringify([
        'https://placehold.co/600x600/1a1a2e/e94560?text=Headphones+1',
        'https://placehold.co/600x600/16213e/e94560?text=Headphones+2',
        'https://placehold.co/600x600/0f3460/e94560?text=Headphones+3',
      ]),
      originalPrice: 49.99,
      displayPrice: 52.49,
      sourceUrl: 'https://www.daraz.lk/products/wireless-bluetooth-headphones',
      source: 'daraz',
      stockStatus: 'In Stock',
      category: 'Electronics',
      isActive: true,
    },
    {
      title: 'Smart Watch Ultra - Fitness Tracker with Heart Rate Monitor',
      description: 'Advanced smartwatch with AMOLED display, heart rate monitoring, GPS tracking, and 7-day battery life. Water resistant to 50m.',
      images: JSON.stringify([
        'https://placehold.co/600x600/0d1b2a/1b9aaa?text=Smart+Watch',
        'https://placehold.co/600x600/1b263b/1b9aaa?text=Watch+2',
      ]),
      originalPrice: 79.99,
      displayPrice: 83.99,
      sourceUrl: 'https://www.aliexpress.com/item/smart-watch-ultra',
      source: 'aliexpress',
      stockStatus: 'In Stock',
      category: 'Electronics',
      isActive: true,
    },
    {
      title: 'Men\'s Casual Cotton T-Shirt - Premium Comfort Fit',
      description: '100% premium cotton t-shirt with a comfortable relaxed fit. Available in multiple colors. Machine washable and durable.',
      images: JSON.stringify([
        'https://placehold.co/600x600/2d3436/636e72?text=T-Shirt',
      ]),
      originalPrice: 12.99,
      displayPrice: 13.64,
      sourceUrl: 'https://www.daraz.lk/products/casual-tshirt-men',
      source: 'daraz',
      stockStatus: 'In Stock',
      category: 'Fashion',
      isActive: true,
    },
    {
      title: 'Portable Bluetooth Speaker - Waterproof IPX7 20W',
      description: 'Powerful 20W portable speaker with deep bass, IPX7 waterproof rating, and 24-hour playtime. Perfect for outdoor adventures.',
      images: JSON.stringify([
        'https://placehold.co/600x600/2c003e/cbeb6e?text=Speaker',
        'https://placehold.co/600x600/512b58/cbeb6e?text=Speaker+2',
      ]),
      originalPrice: 34.99,
      displayPrice: 36.74,
      sourceUrl: 'https://www.aliexpress.com/item/bluetooth-speaker-portable',
      source: 'aliexpress',
      stockStatus: 'In Stock',
      category: 'Electronics',
      isActive: true,
    },
    {
      title: 'Organic Skincare Face Serum - Vitamin C Brightening',
      description: 'Professional-grade vitamin C face serum with hyaluronic acid. Reduces dark spots and brightens skin tone. Suitable for all skin types.',
      images: JSON.stringify([
        'https://placehold.co/600x600/f8e8ee/d63384?text=Serum',
      ]),
      originalPrice: 19.99,
      displayPrice: 20.99,
      sourceUrl: 'https://www.daraz.lk/products/vitamin-c-serum',
      source: 'daraz',
      stockStatus: 'In Stock',
      category: 'Beauty',
      isActive: true,
    },
    {
      title: 'LED Desk Lamp with Wireless Charging Pad',
      description: 'Modern LED desk lamp with built-in wireless charging, 5 brightness levels, 3 color temperatures, and USB-C port.',
      images: JSON.stringify([
        'https://placehold.co/600x600/1a1a1a/f4a261?text=Desk+Lamp',
      ]),
      originalPrice: 29.99,
      displayPrice: 31.49,
      sourceUrl: 'https://www.aliexpress.com/item/led-desk-lamp-wireless',
      source: 'aliexpress',
      stockStatus: 'In Stock',
      category: 'Home & Living',
      isActive: true,
    },
    {
      title: 'Running Shoes Lightweight - Breathable Mesh Sports',
      description: 'Ultra-lightweight running shoes with breathable mesh upper, cushioned sole, and anti-slip rubber outsole. Perfect for jogging and gym.',
      images: JSON.stringify([
        'https://placehold.co/600x600/264653/2a9d8f?text=Running+Shoes',
        'https://placehold.co/600x600/287271/2a9d8f?text=Shoes+Side',
      ]),
      originalPrice: 39.99,
      displayPrice: 41.99,
      sourceUrl: 'https://www.daraz.lk/products/running-shoes-lightweight',
      source: 'daraz',
      stockStatus: 'In Stock',
      category: 'Fashion',
      isActive: true,
    },
    {
      title: 'Stainless Steel Water Bottle - Vacuum Insulated 750ml',
      description: 'Double-wall vacuum insulated water bottle keeps drinks cold for 24 hours or hot for 12 hours. BPA-free, leak-proof lid.',
      images: JSON.stringify([
        'https://placehold.co/600x600/212529/adb5bd?text=Water+Bottle',
      ]),
      originalPrice: 15.99,
      displayPrice: 16.79,
      sourceUrl: 'https://www.aliexpress.com/item/steel-water-bottle',
      source: 'aliexpress',
      stockStatus: 'In Stock',
      category: 'Sports',
      isActive: true,
    },
    {
      title: 'USB-C Hub Multiport Adapter - 7-in-1 with HDMI',
      description: '7-in-1 USB-C hub with 4K HDMI, 2×USB 3.0, SD/TF card reader, and 100W PD charging. Compatible with MacBook, laptop, and tablets.',
      images: JSON.stringify([
        'https://placehold.co/600x600/343a40/e9ecef?text=USB+Hub',
      ]),
      originalPrice: 24.99,
      displayPrice: 26.24,
      sourceUrl: 'https://www.daraz.lk/products/usbc-hub-adapter',
      source: 'daraz',
      stockStatus: 'Limited',
      category: 'Electronics',
      isActive: true,
    },
    {
      title: 'Kids Educational Building Blocks Set - 500 Pieces',
      description: 'Creative building blocks set with 500 pieces in various shapes and colors. Develops creativity and motor skills. Ages 3+.',
      images: JSON.stringify([
        'https://placehold.co/600x600/f8f9fa/ff6b6b?text=Building+Blocks',
        'https://placehold.co/600x600/dee2e6/ff6b6b?text=Blocks+Set',
      ]),
      originalPrice: 27.99,
      displayPrice: 29.39,
      sourceUrl: 'https://www.aliexpress.com/item/building-blocks-kids',
      source: 'aliexpress',
      stockStatus: 'In Stock',
      category: 'Toys & Games',
      isActive: true,
    },
    {
      title: 'Leather Wallet for Men - RFID Blocking Slim Design',
      description: 'Genuine leather wallet with RFID blocking technology. Features 8 card slots, 2 bill compartments, and a coin pocket. Ultra-slim design.',
      images: JSON.stringify([
        'https://placehold.co/600x600/3e2723/8d6e63?text=Leather+Wallet',
      ]),
      originalPrice: 18.99,
      displayPrice: 19.94,
      sourceUrl: 'https://www.daraz.lk/products/leather-wallet-men',
      source: 'daraz',
      stockStatus: 'In Stock',
      category: 'Accessories',
      isActive: true,
    },
    {
      title: 'Aromatherapy Essential Oil Diffuser - 300ml Wood Grain',
      description: 'Ultrasonic essential oil diffuser with 300ml capacity, 7 LED colors, timer settings, and auto shut-off. Beautiful wood grain design.',
      images: JSON.stringify([
        'https://placehold.co/600x600/2d3436/ffeaa7?text=Diffuser',
      ]),
      originalPrice: 22.99,
      displayPrice: 24.14,
      sourceUrl: 'https://www.aliexpress.com/item/aroma-diffuser-wood',
      source: 'aliexpress',
      stockStatus: 'In Stock',
      category: 'Home & Living',
      isActive: true,
    },
  ];

  console.log('Seeding products...');

  for (const product of products) {
    const existing = await db.product.findFirst({
      where: { title: product.title },
    });
    if (!existing) {
      await db.product.create({ data: product });
      console.log(`✓ Created: ${product.title.substring(0, 50)}...`);
    } else {
      console.log(`- Exists: ${product.title.substring(0, 50)}...`);
    }
  }

  console.log(`\nDone! Total products: ${await db.product.count()}`);
}

seedProducts()
  .catch(console.error)
  .finally(() => process.exit(0));
