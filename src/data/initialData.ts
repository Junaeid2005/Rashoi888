import {
  MenuCategory,
  MenuItem,
  ClassicDishPricing,
  Review,
  GalleryItem,
  RestaurantInfo,
  PaymentSettings,
  HomepageSettings
} from '../types';

export const INITIAL_CATEGORIES: MenuCategory[] = [
  { id: 'appetisers', name: 'Appetisers', description: 'Delicate beginnings to your dining experience', order: 1, isVisible: true },
  { id: 'tandoori', name: 'Tandoori Dishes', description: 'All tandoori dishes are charcoal grilled on charcoal in our clay oven.', order: 2, isVisible: true },
  { id: 'rashoi-specials', name: 'Rashoi Special Dishes', description: 'Signature creations infused with authentic whole spices', order: 3, isVisible: true },
  { id: 'balti', name: 'Special Balti Dishes', description: 'Prepared with a Balti sauce, served with a plain naan bread. Dishes can be prepared medium or hot.', order: 4, isVisible: true },
  { id: 'classic-dishes', name: 'Classic Dishes', description: 'Traditional curry favourites cooked with your choice of protein or vegetables.', order: 5, isVisible: true },
  { id: 'hash', name: 'Hash Dishes (Duck)', description: 'Tender roasted duck cooked in rich, aromatic reductions', order: 6, isVisible: true },
  { id: 'keema', name: 'Keema Dishes (Minced Meat)', description: 'Finely minced lean spiced meat slow simmered with fresh herbs', order: 7, isVisible: true },
  { id: 'korai', name: 'Korai Dishes (Medium)', description: 'Wok tossed with fresh peppers, onions, tomatoes and crushed spices', order: 8, isVisible: true },
  { id: 'biriyani', name: 'Biriyani', description: 'A traditional mixed rice dish from the Indian subcontinent, served with vegetable curry.', order: 9, isVisible: true },
  { id: 'vegetable-sides', name: 'Vegetable Side Dishes', description: 'All vegetable dishes are medium spiced, cooked with special herbs and spices.', order: 10, isVisible: true },
  { id: 'rice', name: 'Rice', description: 'Aromatic long grain basmati rice variations', order: 11, isVisible: true },
  { id: 'sundries', name: 'Sundries', description: 'Artisanal clay oven tandoori breads, papadums and accompaniments', order: 12, isVisible: true },
  { id: 'meat-thali', name: 'Meat Thali', description: 'Complete culinary tasting platter for one person', order: 13, isVisible: true },
  { id: 'vegetable-thali', name: 'Vegetable Thali', description: 'Traditional vegetarian banquet on a thali platter', order: 14, isVisible: true },
  { id: 'sunday-special', name: 'Rashoi Sunday Special', description: 'Four-course feast served every Sunday', order: 15, isVisible: true },
];

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  // Appetisers
  { id: 'app-mixed-starter', name: 'Mixed Starter', categoryId: 'appetisers', categoryName: 'Appetisers', price: 6.95, description: 'A mixture of chicken tikka, sheek kebab and onion bhajee', isAvailable: true, order: 1 },
  { id: 'app-mulligatawny-soup', name: 'Mulligatawny Soup', categoryId: 'appetisers', categoryName: 'Appetisers', price: 4.95, isAvailable: true, order: 2 },
  { id: 'app-chicken-tikka', name: 'Chicken Tikka', categoryId: 'appetisers', categoryName: 'Appetisers', price: 5.95, isAvailable: true, order: 3 },
  { id: 'app-lamb-tikka', name: 'Lamb Tikka', categoryId: 'appetisers', categoryName: 'Appetisers', price: 5.95, isAvailable: true, order: 4 },
  { id: 'app-duck-tikka', name: 'Duck Tikka', categoryId: 'appetisers', categoryName: 'Appetisers', price: 6.95, isAvailable: true, order: 5 },
  { id: 'app-chicken-pakora', name: 'Chicken Pakora', categoryId: 'appetisers', categoryName: 'Appetisers', price: 5.95, isAvailable: true, order: 6 },
  { id: 'app-tandoori-chicken', name: 'Tandoori Chicken (On the bone)', categoryId: 'appetisers', categoryName: 'Appetisers', price: 6.95, isAvailable: true, order: 7 },
  { id: 'app-shami-kebab', name: 'Shami Kebab', categoryId: 'appetisers', categoryName: 'Appetisers', price: 5.95, isAvailable: true, order: 8 },
  { id: 'app-sheek-kebab', name: 'Sheek Kebab', categoryId: 'appetisers', categoryName: 'Appetisers', price: 5.95, isAvailable: true, order: 9 },
  { id: 'app-rashmi-kebab', name: 'Rashmi Kebab', categoryId: 'appetisers', categoryName: 'Appetisers', price: 6.95, description: 'Flat minced lamb kebab wrapped with fried egg', isAvailable: true, order: 10 },
  { id: 'app-chicken-lamb-chat-puree', name: 'Chicken or Lamb Chat Puree', categoryId: 'appetisers', categoryName: 'Appetisers', price: 6.95, isAvailable: true, order: 11 },
  { id: 'app-aloo-chat-puree', name: 'Aloo Chat Puree', categoryId: 'appetisers', categoryName: 'Appetisers', price: 5.95, isVegetarian: true, isAvailable: true, order: 12 },
  { id: 'app-prawn-puree', name: 'Prawn Puree', categoryId: 'appetisers', categoryName: 'Appetisers', price: 6.95, isAvailable: true, order: 13 },
  { id: 'app-onion-bhajee', name: 'Onion Bhajee', categoryId: 'appetisers', categoryName: 'Appetisers', price: 4.95, isVegetarian: true, isAvailable: true, order: 14 },
  { id: 'app-meat-veg-samosa', name: 'Meat or Vegetable Samosa', categoryId: 'appetisers', categoryName: 'Appetisers', price: 4.95, isAvailable: true, order: 15 },
  { id: 'app-king-prawn-butterfly', name: 'King Prawn Butterfly', categoryId: 'appetisers', categoryName: 'Appetisers', price: 6.95, isAvailable: true, order: 16 },
  { id: 'app-king-prawn-chat-puree', name: 'King Prawn Puree or Chat Puree', categoryId: 'appetisers', categoryName: 'Appetisers', price: 6.95, isAvailable: true, order: 17 },
  { id: 'app-paneer-shashlik', name: 'Paneer Shashlik', categoryId: 'appetisers', categoryName: 'Appetisers', price: 6.95, description: 'Homemade cheese barbecued with onions, peppers & green chilli', isVegetarian: true, isAvailable: true, order: 18 },
  { id: 'app-prawn-cocktail', name: 'Prawn Cocktail', categoryId: 'appetisers', categoryName: 'Appetisers', price: 4.95, isAvailable: true, order: 19 },
  { id: 'app-lamb-chops', name: 'Lamb Chops', categoryId: 'appetisers', categoryName: 'Appetisers', price: 6.95, isAvailable: true, order: 20 },

  // Tandoori Dishes
  { id: 'tan-half-chicken', name: 'Half Tandoori Chicken (On the bone)', categoryId: 'tandoori', categoryName: 'Tandoori Dishes', price: 11.95, isAvailable: true, order: 1 },
  { id: 'tan-lamb-chops', name: 'Tandoori Lamb Chops', categoryId: 'tandoori', categoryName: 'Tandoori Dishes', price: 12.95, isAvailable: true, isFeatured: true, order: 2 },
  { id: 'tan-chicken-tikka', name: 'Chicken Tikka', categoryId: 'tandoori', categoryName: 'Tandoori Dishes', price: 10.95, isAvailable: true, order: 3 },
  { id: 'tan-lamb-tikka', name: 'Lamb Tikka', categoryId: 'tandoori', categoryName: 'Tandoori Dishes', price: 10.95, isAvailable: true, order: 4 },
  { id: 'tan-duck-tikka', name: 'Duck Tikka', categoryId: 'tandoori', categoryName: 'Tandoori Dishes', price: 13.95, isAvailable: true, order: 5 },
  { id: 'tan-sheek-kebab', name: 'Sheek Kebab (4 Pieces)', categoryId: 'tandoori', categoryName: 'Tandoori Dishes', price: 11.95, isAvailable: true, order: 6 },
  { id: 'tan-mixed-grill', name: 'Tandoori Mixed Grill', categoryId: 'tandoori', categoryName: 'Tandoori Dishes', price: 14.95, description: 'A combination of chicken, lamb, sheek kebab and tandoori chicken', isAvailable: true, isFeatured: true, order: 7 },
  { id: 'tan-chicken-shashlik', name: 'Chicken Shashlik', categoryId: 'tandoori', categoryName: 'Tandoori Dishes', price: 11.95, isAvailable: true, order: 8 },
  { id: 'tan-lamb-shashlik', name: 'Lamb Shashlik', categoryId: 'tandoori', categoryName: 'Tandoori Dishes', price: 12.95, isAvailable: true, order: 9 },
  { id: 'tan-king-prawn-shashlik', name: 'Tandoori King Prawn Shashlik', categoryId: 'tandoori', categoryName: 'Tandoori Dishes', price: 14.95, isAvailable: true, order: 10 },
  { id: 'tan-king-prawn', name: 'Tandoori King Prawn', categoryId: 'tandoori', categoryName: 'Tandoori Dishes', price: 13.95, isAvailable: true, order: 11 },
  { id: 'tan-trout', name: 'Trout Tandoori', categoryId: 'tandoori', categoryName: 'Tandoori Dishes', price: 13.95, description: 'Grilled in clay oven, specially marinated in yoghurt and herbs', isAvailable: true, order: 12 },
  { id: 'tan-paneer-shashlik', name: 'Paneer Shashlik', categoryId: 'tandoori', categoryName: 'Tandoori Dishes', price: 11.95, description: 'Homemade Indian cheese with peppers, onions and tomatoes subtly spiced and slow cooked in clay oven', isVegetarian: true, isAvailable: true, order: 13 },

  // Rashoi Special Dishes
  { id: 'spec-chefs-special', name: "Chef's Special", categoryId: 'rashoi-specials', categoryName: 'Rashoi Special Dishes', price: 12.95, description: 'Specially spiced chicken with minced meat, egg, tomatoes.', isChefsSpecial: true, isFeatured: true, isAvailable: true, order: 1 },
  { id: 'spec-king-prawn-jhul', name: 'King Prawn Jhul', categoryId: 'rashoi-specials', categoryName: 'Rashoi Special Dishes', price: 13.95, description: 'Marinated king prawns cooked with grilled tomatoes, onions, green pepper and garlic. Lightly spiced.', isAvailable: true, order: 2 },
  { id: 'spec-paneer-korai', name: 'Paneer Korai', categoryId: 'rashoi-specials', categoryName: 'Rashoi Special Dishes', price: 11.95, description: 'Cubes of homemade cheese, coarsely ground roasted with spices with onions, peppers, tomatoes, coriander and fenugreek.', isVegetarian: true, isAvailable: true, order: 3 },
  { id: 'spec-chicken-muglai', name: 'Chicken Muglai', categoryId: 'rashoi-specials', categoryName: 'Rashoi Special Dishes', price: 12.95, description: 'Tender medium spicy, chicken with mince meat and egg, bursting with flavours.', isAvailable: true, order: 4 },
  { id: 'spec-tandoori-special-chicken', name: 'Tandoori Special Chicken', categoryId: 'rashoi-specials', categoryName: 'Rashoi Special Dishes', price: 12.95, description: 'Tender pieces of chicken specially cooked with onions, herbs & green pepper.', isAvailable: true, order: 5 },
  { id: 'spec-tandoori-special-lamb', name: 'Tandoori Special Lamb', categoryId: 'rashoi-specials', categoryName: 'Rashoi Special Dishes', price: 13.95, description: 'Lamb specially cooked with onions, herbs and green pepper.', isAvailable: true, order: 6 },
  { id: 'spec-seabass-special', name: 'Seabass Special', categoryId: 'rashoi-specials', categoryName: 'Rashoi Special Dishes', price: 13.95, description: 'Freshly chopped seabass infused with whole spices with a medium sauce.', isFeatured: true, isAvailable: true, order: 7 },
  { id: 'spec-king-prawn-korai', name: 'Tandoori King Prawn Korai', categoryId: 'rashoi-specials', categoryName: 'Rashoi Special Dishes', price: 13.95, description: 'Grilled in clay oven and marinated with fresh garlic and spices.', isAvailable: true, order: 8 },
  { id: 'spec-king-prawn-jalfrezi', name: 'Tandoori King Prawn Jalfrezi', categoryId: 'rashoi-specials', categoryName: 'Rashoi Special Dishes', price: 13.95, description: 'Grilled in clay oven, medium to hot dish, prepared with fresh green chillies, capsicum, onions and tomatoes.', isAvailable: true, order: 9 },
  { id: 'spec-roop-chada', name: 'Roop Chada', categoryId: 'rashoi-specials', categoryName: 'Rashoi Special Dishes', price: 13.95, description: 'Fresh Bangladeshi fish cooked in fried onions, with tomatoes, green peppers and mushrooms with a textured flavour.', isAvailable: true, order: 10 },
  { id: 'spec-mass-masala', name: 'Mass Masala', categoryId: 'rashoi-specials', categoryName: 'Rashoi Special Dishes', price: 12.95, description: 'Semi-dry Talapia fish in a medium curry mixed with special herbs.', isAvailable: true, order: 11 },
  { id: 'spec-king-prawn-masala', name: 'Tandoori King Prawn Masala', categoryId: 'rashoi-specials', categoryName: 'Rashoi Special Dishes', price: 13.95, description: 'Marinated in yoghurt and spices, cooked in clay oven, stir fried in a medium masala.', isAvailable: true, order: 12 },
  { id: 'spec-rezala', name: 'Chicken or Lamb Rezala', categoryId: 'rashoi-specials', categoryName: 'Rashoi Special Dishes', price: 11.95, description: 'Chicken or lamb marinated in a spicy yoghurt sauce and prepared with onions, herbs and fresh coriander.', isAvailable: true, order: 13 },
  { id: 'spec-ada-murgh', name: 'Ada Murgh or Gohst', categoryId: 'rashoi-specials', categoryName: 'Rashoi Special Dishes', price: 11.95, description: 'Chicken or lamb flavoured with ginger.', isAvailable: true, order: 14 },
  { id: 'spec-garlic-chicken-lamb', name: 'Garlic Chicken or Lamb', categoryId: 'rashoi-specials', categoryName: 'Rashoi Special Dishes', price: 11.95, description: 'Slightly hot chicken cooked with herb and fried in garlic.', isAvailable: true, order: 15 },
  { id: 'spec-acheri', name: 'Acheri Chicken or Lamb', categoryId: 'rashoi-specials', categoryName: 'Rashoi Special Dishes', price: 11.95, description: 'Cooked with pickles with a hot sour taste.', isAvailable: true, order: 16 },
  { id: 'spec-chilli-masala', name: 'Chilli Chicken or Lamb Masala', categoryId: 'rashoi-specials', categoryName: 'Rashoi Special Dishes', price: 11.95, description: 'Chicken or lamb cooked with herbs or chilli.', isAvailable: true, order: 17 },
  { id: 'spec-butter-chicken', name: 'Butter Chicken', categoryId: 'rashoi-specials', categoryName: 'Rashoi Special Dishes', price: 11.95, description: 'Soft marinated chicken with a creamy sweet sauce.', isAvailable: true, isFeatured: true, order: 18 },
  { id: 'spec-nagga-chicken', name: 'Nagga Chicken', categoryId: 'rashoi-specials', categoryName: 'Rashoi Special Dishes', price: 11.95, description: 'A very hot curry cooked with onions and garlic.', isAvailable: true, order: 19 },
  { id: 'spec-makani', name: 'Chicken or Lamb Makani', categoryId: 'rashoi-specials', categoryName: 'Rashoi Special Dishes', price: 11.95, description: 'Chicken or lamb cooked with almonds and mint yoghurt and butter.', isAvailable: true, order: 20 },

  // Classic Dishes (Curry Favourites)
  { id: 'classic-korma', name: 'Chicken or Lamb Korma', categoryId: 'classic-dishes', categoryName: 'Classic Dishes', price: 9.95, description: 'A delicate preparation of yoghurt, cream and ground spices producing a rich, mild and creamy texture.', isAvailable: true, order: 1 },
  { id: 'classic-kashmiri', name: 'Chicken or Lamb Kashmiri', categoryId: 'classic-dishes', categoryName: 'Classic Dishes', price: 9.95, description: 'A mild and fruity curry infused with bananas, lychees and a rich creamy sauce.', isAvailable: true, order: 2 },
  { id: 'classic-madras', name: 'Chicken or Lamb Madras', categoryId: 'classic-dishes', categoryName: 'Classic Dishes', price: 9.95, description: 'A richly spiced South Indian favourite with a fiery, hot and sour taste with fresh lemon.', isAvailable: true, order: 3 },
  { id: 'classic-vindaloo', name: 'Chicken or Lamb Vindaloo', categoryId: 'classic-dishes', categoryName: 'Classic Dishes', price: 9.95, description: 'An extra hot, fiery curry with red chillies, vinegar, garlic and diced potatoes.', isAvailable: true, order: 4 },
  { id: 'classic-rogan-josh', name: 'Chicken or Lamb Rogan Josh', categoryId: 'classic-dishes', categoryName: 'Classic Dishes', price: 9.95, description: 'Tender meat slow simmered in an aromatic spiced tomato, garlic, ginger and fresh coriander reduction.', isAvailable: true, isFeatured: true, order: 5 },
  { id: 'classic-bhuna', name: 'Chicken or Lamb Bhuna', categoryId: 'classic-dishes', categoryName: 'Classic Dishes', price: 9.95, description: 'Thoroughly seasoned with finely chopped onions, capsicum, fresh coriander and thick spicy sauce.', isAvailable: true, order: 6 },
  { id: 'classic-dupiaza', name: 'Chicken or Lamb Dupiaza', categoryId: 'classic-dishes', categoryName: 'Classic Dishes', price: 9.95, description: 'Medium spiced dish prepared with seasoned braised onions and briskly fried peppers.', isAvailable: true, order: 7 },
  { id: 'classic-pathia', name: 'Chicken or Lamb Pathia', categoryId: 'classic-dishes', categoryName: 'Classic Dishes', price: 9.95, description: 'Sweet, sour and hot curry cooked with rich tomatoes and fresh lemon juice.', isAvailable: true, order: 8 },
  { id: 'classic-danshak', name: 'Chicken or Lamb Danshak', categoryId: 'classic-dishes', categoryName: 'Classic Dishes', price: 10.95, description: 'Persian-style curry cooked with yellow lentils, lemon and pineapple in a sweet and sour sauce.', isAvailable: true, order: 9 },
  { id: 'classic-sag', name: 'Chicken or Lamb Sag', categoryId: 'classic-dishes', categoryName: 'Classic Dishes', price: 10.95, description: 'Slow cooked tender pieces with fresh tempered garden spinach, garlic and fragrant spices.', isAvailable: true, order: 10 },
  { id: 'classic-tikka-masala', name: 'Chicken or Lamb Tikka Masala', categoryId: 'classic-dishes', categoryName: 'Classic Dishes', price: 10.95, description: 'Charcoal grilled tikka pieces simmered in our famous velvety tomato, almond and rich butter sauce.', isAvailable: true, isFeatured: true, order: 11 },
  { id: 'classic-passanda', name: 'Chicken or Lamb Passanda', categoryId: 'classic-dishes', categoryName: 'Classic Dishes', price: 10.95, description: 'Tender sliced meat marinated in yoghurt and mild spices, cooked in a fragrant creamy sauce with almonds.', isAvailable: true, order: 12 },
  { id: 'classic-jalfrezi', name: 'Chicken or Lamb Jalfrezi', categoryId: 'classic-dishes', categoryName: 'Classic Dishes', price: 10.95, description: 'Fairly hot dish stir-fried with fresh green chillies, peppers, onions and fresh ground spices.', isAvailable: true, order: 13 },
  { id: 'classic-tikka-danshak', name: 'Tikka Danshak (Chicken or Lamb)', categoryId: 'classic-dishes', categoryName: 'Classic Dishes', price: 11.95, description: 'Charcoal-grilled tikka slow simmered with lentils in a piquant sweet, sour and hot sauce.', isAvailable: true, order: 14 },

  // Special Balti Dishes
  { id: 'balti-chicken-lamb', name: 'Chicken or Lamb Balti', categoryId: 'balti', categoryName: 'Special Balti Dishes', price: 13.95, isAvailable: true, order: 1 },
  { id: 'balti-hash', name: 'Hash Balti (Duck)', categoryId: 'balti', categoryName: 'Special Balti Dishes', price: 14.95, isAvailable: true, order: 2 },
  { id: 'balti-prawn', name: 'Prawn Balti', categoryId: 'balti', categoryName: 'Special Balti Dishes', price: 13.95, isAvailable: true, order: 3 },
  { id: 'balti-king-prawn', name: 'King Prawn Balti', categoryId: 'balti', categoryName: 'Special Balti Dishes', price: 14.95, isAvailable: true, order: 4 },
  { id: 'balti-vegetable', name: 'Vegetable Balti', categoryId: 'balti', categoryName: 'Special Balti Dishes', price: 11.95, isVegetarian: true, isAvailable: true, order: 5 },

  // Hash Dishes (Duck)
  { id: 'hash-tikka-masala', name: 'Hash Tikka Masala', categoryId: 'hash', categoryName: 'Hash Dishes (Duck)', price: 13.95, isAvailable: true, order: 1 },
  { id: 'hash-bhuna', name: 'Hash Bhuna', categoryId: 'hash', categoryName: 'Hash Dishes (Duck)', price: 13.95, isAvailable: true, order: 2 },
  { id: 'hash-korai', name: 'Hash Korai', categoryId: 'hash', categoryName: 'Hash Dishes (Duck)', price: 13.95, isAvailable: true, order: 3 },
  { id: 'hash-shashlik', name: 'Hash Shashlik', categoryId: 'hash', categoryName: 'Hash Dishes (Duck)', price: 13.95, isAvailable: true, order: 4 },
  { id: 'hash-jalfrezi', name: 'Hash Jalfrezi', categoryId: 'hash', categoryName: 'Hash Dishes (Duck)', price: 13.95, isAvailable: true, order: 5 },

  // Keema Dishes
  { id: 'keema-bhuna', name: 'Keema Bhuna', categoryId: 'keema', categoryName: 'Keema Dishes (Minced Meat)', price: 10.95, isAvailable: true, order: 1 },
  { id: 'keema-aloo-peas', name: 'Keema Aloo & Peas', categoryId: 'keema', categoryName: 'Keema Dishes (Minced Meat)', price: 11.95, isAvailable: true, order: 2 },

  // Korai Dishes
  { id: 'korai-chicken', name: 'Korai Chicken', categoryId: 'korai', categoryName: 'Korai Dishes (Medium)', price: 11.95, isAvailable: true, order: 1 },
  { id: 'korai-lamb', name: 'Korai Lamb', categoryId: 'korai', categoryName: 'Korai Dishes (Medium)', price: 11.95, isAvailable: true, order: 2 },
  { id: 'korai-tikka-kebab', name: 'Korai Tikka Kebab', categoryId: 'korai', categoryName: 'Korai Dishes (Medium)', price: 11.95, isAvailable: true, order: 3 },

  // Biriyani
  { id: 'bir-rashoi-special', name: 'Rashoi Special Biriyani', categoryId: 'biriyani', categoryName: 'Biriyani', price: 14.95, description: 'Cooked with chicken, lamb, prawn, king prawn and topped with an egg.', isFeatured: true, isAvailable: true, order: 1 },
  { id: 'bir-chicken-lamb', name: 'Chicken or Lamb Biriyani', categoryId: 'biriyani', categoryName: 'Biriyani', price: 11.95, isAvailable: true, order: 2 },
  { id: 'bir-tikka', name: 'Chicken or Lamb Tikka Biriyani', categoryId: 'biriyani', categoryName: 'Biriyani', price: 12.95, isAvailable: true, order: 3 },
  { id: 'bir-prawn', name: 'Prawn Biriyani', categoryId: 'biriyani', categoryName: 'Biriyani', price: 12.95, isAvailable: true, order: 4 },
  { id: 'bir-king-prawn', name: 'King Prawn Biriyani', categoryId: 'biriyani', categoryName: 'Biriyani', price: 14.95, isAvailable: true, order: 5 },
  { id: 'bir-vegetable', name: 'Vegetable Biriyani', categoryId: 'biriyani', categoryName: 'Biriyani', price: 10.95, isVegetarian: true, isAvailable: true, order: 6 },

  // Vegetable Side Dishes
  { id: 'veg-mixed', name: 'Mixed Vegetable Bhajee or Curry', categoryId: 'vegetable-sides', categoryName: 'Vegetable Side Dishes', price: 5.25, isVegetarian: true, isAvailable: true, order: 1 },
  { id: 'veg-brinjal', name: 'Brinjal Bhajee (Aubergines)', categoryId: 'vegetable-sides', categoryName: 'Vegetable Side Dishes', price: 5.25, isVegetarian: true, isAvailable: true, order: 2 },
  { id: 'veg-bhindi', name: 'Bhindi Bhajee (Okra)', categoryId: 'vegetable-sides', categoryName: 'Vegetable Side Dishes', price: 5.25, isVegetarian: true, isAvailable: true, order: 3 },
  { id: 'veg-sag', name: 'Sag Bhajee (Spinach)', categoryId: 'vegetable-sides', categoryName: 'Vegetable Side Dishes', price: 5.25, isVegetarian: true, isAvailable: true, order: 4 },
  { id: 'veg-mushroom', name: 'Mushroom Bhajee', categoryId: 'vegetable-sides', categoryName: 'Vegetable Side Dishes', price: 5.25, isVegetarian: true, isAvailable: true, order: 5 },
  { id: 'veg-kofta', name: 'Vegetable Kofta (Vegetable dumplings)', categoryId: 'vegetable-sides', categoryName: 'Vegetable Side Dishes', price: 5.25, isVegetarian: true, isAvailable: true, order: 6 },
  { id: 'veg-bombay-aloo', name: 'Bombay Aloo', categoryId: 'vegetable-sides', categoryName: 'Vegetable Side Dishes', price: 5.25, isVegetarian: true, isAvailable: true, order: 7 },
  { id: 'veg-aloo-ghobi', name: 'Aloo Ghobi (Dry, spiced potato with cauliflower)', categoryId: 'vegetable-sides', categoryName: 'Vegetable Side Dishes', price: 5.25, isVegetarian: true, isAvailable: true, order: 8 },
  { id: 'veg-ghobi', name: 'Ghobi Bhajee (Spiced cauliflower)', categoryId: 'vegetable-sides', categoryName: 'Vegetable Side Dishes', price: 5.25, isVegetarian: true, isAvailable: true, order: 9 },
  { id: 'veg-sag-aloo', name: 'Sag Aloo (Spinach with potato)', categoryId: 'vegetable-sides', categoryName: 'Vegetable Side Dishes', price: 5.25, isVegetarian: true, isAvailable: true, order: 10 },
  { id: 'veg-sag-paneer', name: 'Sag Paneer (Spinach with homemade Indian cheese)', categoryId: 'vegetable-sides', categoryName: 'Vegetable Side Dishes', price: 5.25, isVegetarian: true, isAvailable: true, order: 11 },
  { id: 'veg-mutter-paneer', name: 'Mutter Paneer (Green peas with homemade Indian cheese)', categoryId: 'vegetable-sides', categoryName: 'Vegetable Side Dishes', price: 5.25, isVegetarian: true, isAvailable: true, order: 12 },
  { id: 'veg-sag-cream', name: 'Sag Cream (Spinach with cream)', categoryId: 'vegetable-sides', categoryName: 'Vegetable Side Dishes', price: 5.25, isVegetarian: true, isAvailable: true, order: 13 },
  { id: 'veg-chana-masala', name: 'Chana Masala (Chick peas)', categoryId: 'vegetable-sides', categoryName: 'Vegetable Side Dishes', price: 5.25, isVegetarian: true, isAvailable: true, order: 14 },
  { id: 'veg-tarka-dall', name: 'Tarka Dall (Lentils with garlic)', categoryId: 'vegetable-sides', categoryName: 'Vegetable Side Dishes', price: 5.25, isVegetarian: true, isAvailable: true, order: 15 },
  { id: 'veg-onion-bhajee-side', name: 'Onion Bhajee', categoryId: 'vegetable-sides', categoryName: 'Vegetable Side Dishes', price: 4.95, isVegetarian: true, isAvailable: true, order: 16 },
  { id: 'veg-dall-samba', name: 'Dall Samba (Lentils with spinach)', categoryId: 'vegetable-sides', categoryName: 'Vegetable Side Dishes', price: 5.25, isVegetarian: true, isAvailable: true, order: 17 },
  { id: 'veg-aloo-peas', name: 'Aloo Peas (Potato with green peas)', categoryId: 'vegetable-sides', categoryName: 'Vegetable Side Dishes', price: 5.25, isVegetarian: true, isAvailable: true, order: 18 },

  // Rice
  { id: 'rice-boiled', name: 'Boiled Rice', categoryId: 'rice', categoryName: 'Rice', price: 3.00, isVegetarian: true, isAvailable: true, order: 1 },
  { id: 'rice-pilau', name: 'Pilau Rice', categoryId: 'rice', categoryName: 'Rice', price: 3.25, isVegetarian: true, isAvailable: true, order: 2 },
  { id: 'rice-mushroom', name: 'Mushroom Rice', categoryId: 'rice', categoryName: 'Rice', price: 4.25, isVegetarian: true, isAvailable: true, order: 3 },
  { id: 'rice-veg-pulao', name: 'Vegetable Pulao Rice', categoryId: 'rice', categoryName: 'Rice', price: 4.25, isVegetarian: true, isAvailable: true, order: 4 },
  { id: 'rice-special-fried', name: 'Special Fried Rice', categoryId: 'rice', categoryName: 'Rice', price: 4.25, isAvailable: true, order: 5 },
  { id: 'rice-coconut', name: 'Coconut Rice', categoryId: 'rice', categoryName: 'Rice', price: 4.25, isVegetarian: true, isAvailable: true, order: 6 },
  { id: 'rice-lemon', name: 'Lemon Rice', categoryId: 'rice', categoryName: 'Rice', price: 4.25, isVegetarian: true, isAvailable: true, order: 7 },
  { id: 'rice-keema', name: 'Keema Rice', categoryId: 'rice', categoryName: 'Rice', price: 4.25, isAvailable: true, order: 8 },
  { id: 'rice-egg', name: 'Egg Rice', categoryId: 'rice', categoryName: 'Rice', price: 4.25, isAvailable: true, order: 9 },
  { id: 'rice-garlic-onion', name: 'Garlic or Onion Fried Rice', categoryId: 'rice', categoryName: 'Rice', price: 4.25, isVegetarian: true, isAvailable: true, order: 10 },
  { id: 'rice-peas', name: 'Peas Rice', categoryId: 'rice', categoryName: 'Rice', price: 4.25, isVegetarian: true, isAvailable: true, order: 11 },

  // Sundries
  { id: 'sun-naan', name: 'Naan', categoryId: 'sundries', categoryName: 'Sundries', price: 2.95, isVegetarian: true, isAvailable: true, order: 1 },
  { id: 'sun-chilli-naan', name: 'Chilli Naan', categoryId: 'sundries', categoryName: 'Sundries', price: 3.95, isVegetarian: true, isAvailable: true, order: 2 },
  { id: 'sun-peshwari-naan', name: 'Peshwari Naan', categoryId: 'sundries', categoryName: 'Sundries', price: 3.95, isVegetarian: true, isAvailable: true, order: 3 },
  { id: 'sun-cheese-naan', name: 'Cheese Naan', categoryId: 'sundries', categoryName: 'Sundries', price: 3.95, isVegetarian: true, isAvailable: true, order: 4 },
  { id: 'sun-garlic-naan', name: 'Garlic Naan', categoryId: 'sundries', categoryName: 'Sundries', price: 3.95, isVegetarian: true, isAvailable: true, order: 5 },
  { id: 'sun-keema-naan', name: 'Keema Naan', categoryId: 'sundries', categoryName: 'Sundries', price: 3.95, isAvailable: true, order: 6 },
  { id: 'sun-kulcha-naan', name: 'Kulcha Naan (Stuffed with vegetables)', categoryId: 'sundries', categoryName: 'Sundries', price: 3.95, isVegetarian: true, isAvailable: true, order: 7 },
  { id: 'sun-chapati', name: 'Chapati', categoryId: 'sundries', categoryName: 'Sundries', price: 2.00, isVegetarian: true, isAvailable: true, order: 8 },
  { id: 'sun-tandoori-roti', name: 'Tandoori Roti', categoryId: 'sundries', categoryName: 'Sundries', price: 2.95, isVegetarian: true, isAvailable: true, order: 9 },
  { id: 'sun-paratha', name: 'Paratha (Bread cooked in butter)', categoryId: 'sundries', categoryName: 'Sundries', price: 3.50, isVegetarian: true, isAvailable: true, order: 10 },
  { id: 'sun-stuffed-paratha', name: 'Stuffed Paratha (Stuffed with vegetables)', categoryId: 'sundries', categoryName: 'Sundries', price: 3.95, isVegetarian: true, isAvailable: true, order: 11 },
  { id: 'sun-popadom', name: 'Popadom plain or spicy', categoryId: 'sundries', categoryName: 'Sundries', price: 0.90, isVegetarian: true, isAvailable: true, order: 12 },
  { id: 'sun-chips', name: 'Chips', categoryId: 'sundries', categoryName: 'Sundries', price: 2.75, isVegetarian: true, isAvailable: true, order: 13 },
  { id: 'sun-raita', name: 'Raita (Plain yoghurt with cucumber or onions)', categoryId: 'sundries', categoryName: 'Sundries', price: 2.25, isVegetarian: true, isAvailable: true, order: 14 },
  { id: 'sun-chutney', name: 'Chutney', categoryId: 'sundries', categoryName: 'Sundries', price: 0.90, isVegetarian: true, isAvailable: true, order: 15 },

  // Meat Thali
  { id: 'thali-meat', name: 'Meat Thali', categoryId: 'meat-thali', categoryName: 'Meat Thali', price: 16.95, description: 'Pieces of Tandoori Chicken, Sheek Kebab, Lamb Rogan Josh and Saag Bhajee with Pilau Rice, Plain Naan and Yoghurt.', isFeatured: true, isAvailable: true, order: 1 },

  // Vegetable Thali
  { id: 'thali-vegetable', name: 'Vegetable Thali', categoryId: 'vegetable-thali', categoryName: 'Vegetable Thali', price: 13.95, description: 'Saag Bhajee, Aloo Bhajee, Bhindi Bhajee, Daal and Onion Bhajee. Served with Pilau Rice and Plain Naan.', isVegetarian: true, isFeatured: true, isAvailable: true, order: 1 },

  // Rashoi Sunday Special
  { id: 'sunday-special-deal', name: 'Rashoi Sunday Special', categoryId: 'sunday-special', categoryName: 'Rashoi Sunday Special', price: 15.95, description: 'Four Course Meal: A starter, a main dish, a side dish and Rice or Naan. King prawn starters add £1.95. King prawn main dishes add £3.95.', isFeatured: true, isAvailable: true, order: 1 },
];

export const INITIAL_CLASSIC_DISHES: ClassicDishPricing[] = [
  { id: 'korma', dishName: 'Korma', chickenPrice: 9.95, lambPrice: 9.95, prawnPrice: 10.95, kingPrawnPrice: 11.95, vegPrice: 8.95, order: 1 },
  { id: 'kashmiri', dishName: 'Kashmiri', chickenPrice: 9.95, lambPrice: 9.95, prawnPrice: 10.95, kingPrawnPrice: 11.95, vegPrice: 8.95, order: 2 },
  { id: 'madras', dishName: 'Madras', chickenPrice: 9.95, lambPrice: 9.95, prawnPrice: 10.95, kingPrawnPrice: 11.95, vegPrice: 8.95, order: 3 },
  { id: 'vindaloo', dishName: 'Vindaloo', chickenPrice: 9.95, lambPrice: 9.95, prawnPrice: 10.95, kingPrawnPrice: 11.95, vegPrice: 8.95, order: 4 },
  { id: 'rogan-josh', dishName: 'Rogan Josh', chickenPrice: 9.95, lambPrice: 9.95, prawnPrice: 10.95, kingPrawnPrice: 11.95, vegPrice: 8.95, order: 5 },
  { id: 'bhuna', dishName: 'Bhuna', chickenPrice: 9.95, lambPrice: 9.95, prawnPrice: 10.95, kingPrawnPrice: 11.95, vegPrice: 8.95, order: 6 },
  { id: 'dupiaza', dishName: 'Dupiaza', chickenPrice: 9.95, lambPrice: 9.95, prawnPrice: 10.95, kingPrawnPrice: 11.95, vegPrice: 8.95, order: 7 },
  { id: 'pathia', dishName: 'Pathia', chickenPrice: 9.95, lambPrice: 9.95, prawnPrice: 10.95, kingPrawnPrice: 11.95, vegPrice: 8.95, order: 8 },
  { id: 'danshak', dishName: 'Danshak', chickenPrice: 10.95, lambPrice: 10.95, prawnPrice: 10.95, kingPrawnPrice: 12.95, vegPrice: 8.95, order: 9 },
  { id: 'sag', dishName: 'Sag', chickenPrice: 10.95, lambPrice: 10.95, prawnPrice: 10.95, kingPrawnPrice: 12.95, vegPrice: 8.95, order: 10 },
  { id: 'tikka-masala', dishName: 'Tikka Masala', chickenPrice: 10.95, lambPrice: 10.95, prawnPrice: 10.95, kingPrawnPrice: null, vegPrice: 8.95, order: 11 },
  { id: 'passanda', dishName: 'Passanda', chickenPrice: 10.95, lambPrice: 10.95, prawnPrice: 10.95, kingPrawnPrice: 12.95, vegPrice: 8.95, order: 12 },
  { id: 'jalfrezi', dishName: 'Jalfrezi', chickenPrice: 10.95, lambPrice: 10.95, prawnPrice: 10.95, kingPrawnPrice: 12.95, vegPrice: 8.95, order: 13 },
  { id: 'tikka-danshak', dishName: 'Tikka Danshak', chickenPrice: 11.95, lambPrice: 11.95, prawnPrice: null, kingPrawnPrice: 12.95, vegPrice: 8.95, order: 14 },
];

export const INITIAL_RESTAURANT_INFO: RestaurantInfo = {
  name: 'Rashoi Restaurant',
  tagline: 'The Indian Kitchen',
  address: '58 Updown Hill',
  postcode: 'GU20 6DX',
  city: 'Windlesham',
  county: 'Surrey',
  country: 'United Kingdom',
  phone: '01276 473000',
  email: 'info@rashoirestaurant.co.uk',
  googleMapsUrl: 'https://share.google/m1l4gEswAPjn9ckfn',
  openingHours: [
    { days: 'Monday – Thursday', hours: '5:30 PM – 10:30 PM' },
    { days: 'Friday – Saturday', hours: '5:00 PM – 11:00 PM' },
    { days: 'Sunday', hours: '12:00 PM – 10:00 PM (Sunday Special All Day)' },
  ],
};

export const INITIAL_PAYMENT_SETTINGS: PaymentSettings = {
  stripeEnabled: false,
  stripeConfigured: false,
  currency: 'GBP',
  checkoutProvider: 'stripe',
  collectionDiscountEnabled: true,
  collectionDiscountPercent: 10,
};

export const INITIAL_HOMEPAGE_SETTINGS: HomepageSettings = {
  heroEyebrow: 'AUTHENTIC INDIAN CUISINE',
  heroHeading: 'Discover the Art of Traditional Indian Flavours.',
  heroSupportingText: 'Experience the richness of Indian cuisine, where traditional recipes, authentic spices and exceptional hospitality come together.',
  heroPrimaryBtnText: 'Book a Table',
  heroSecondaryBtnText: 'Explore Menu & Order',
  heroImageUrl: '/src/assets/images/rashoi_hero_cuisine_1794139786997.jpg',
  introHeading: "A Taste of India's Rich Heritage",
  introParagraph1: 'India is a land of culture and tradition, a land of many cuisines. This is not only due to its sheer size, but also due to the impact of various phases in her history.',
  introParagraph2: 'Rashoi or The Indian Kitchen has survived the impact over the centuries, has matured over the years and imbibed the best of all cultures.',
  introImageUrl: '/src/assets/images/rashoi_interior_dining_1794139799818.jpg',
  specialFeatureTitle: 'Rashoi Sunday Special',
  specialFeatureSubtitle: 'A FOUR-COURSE CULINARY JOURNEY',
  specialFeatureDescription: 'Every Sunday, indulge in our curated four-course feast including your choice of starter, exquisite main course, artisanal vegetable side dish, and aromatic pilau rice or tandoori naan bread.',
  specialFeaturePrice: '£15.95 per person',
  specialFeatureImageUrl: '/src/assets/images/rashoi_signature_dish_1794139812970.jpg',
  reservationHeading: 'Reserve Your Table',
  reservationSupportingText: 'Join us for an unforgettable dining experience at Rashoi Restaurant in Windlesham, Surrey.',
};

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    customerName: 'David & Sarah Jenkins',
    rating: 5,
    reviewText: 'Outstanding authentic dining in Windlesham. The Tandoori Lamb Chops were melt-in-the-mouth, perfectly spiced with smoky clay-oven flavours. The ambience is truly luxurious.',
    date: 'October 2026',
    isPublished: true,
    isFeatured: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'rev-2',
    customerName: 'Marcus Thornton',
    rating: 5,
    reviewText: "Rashoi is by far the finest Indian restaurant in Surrey. The Chef's Special chicken with minced meat and egg was extraordinary, and the hospitality was warm and attentive.",
    date: 'November 2026',
    isPublished: true,
    isFeatured: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'rev-3',
    customerName: 'Elena Rostova',
    rating: 5,
    reviewText: 'The Sunday Special is unbeatable value for such high gourmet standards. Delicious freshly made peshwari naan and garlic chicken. A true culinary gem.',
    date: 'September 2026',
    isPublished: true,
    isFeatured: true,
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_GALLERY: GalleryItem[] = [
  {
    id: 'gal-1',
    title: 'Royal Table Spread',
    imageUrl: '/src/assets/images/rashoi_hero_cuisine_1794139786997.jpg',
    category: 'Cuisine',
    isPublished: true,
    order: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 'gal-2',
    title: 'Intimate Candlelit Dining Room',
    imageUrl: '/src/assets/images/rashoi_interior_dining_1794139799818.jpg',
    category: 'Ambience',
    isPublished: true,
    order: 2,
    createdAt: new Date().toISOString()
  },
  {
    id: 'gal-3',
    title: 'Sizzling Charcoal Tandoor Platter',
    imageUrl: '/src/assets/images/rashoi_signature_dish_1794139812970.jpg',
    category: 'Tandoor',
    isPublished: true,
    order: 3,
    createdAt: new Date().toISOString()
  }
];
