import appetiserImg from '../assets/images/rashoi_appetisers_platter_1794141766142.jpg';
import tandoorImg from '../assets/images/rashoi_signature_dish_1794139812970.jpg';
import curryImg from '../assets/images/rashoi_rich_curry_1794141781153.jpg';
import biriyaniImg from '../assets/images/rashoi_royal_biriyani_1794141795126.jpg';
import seafoodImg from '../assets/images/rashoi_seafood_special_1794141808693.jpg';
import thaliImg from '../assets/images/rashoi_thali_banquet_1794141821766.jpg';
import breadsImg from '../assets/images/rashoi_naan_breads_1794141835693.jpg';
import feastImg from '../assets/images/rashoi_hero_cuisine_1794139786997.jpg';

export interface DishVisualMeta {
  imageUrl: string;
  spiceLevel: 'mild' | 'medium' | 'hot';
  pairing: string;
  tags: string[];
}

/**
 * Resolves high-resolution culinary photography and culinary metadata
 * for every dish in Rashoi's repertoire.
 */
export function getDishVisualMeta(dish: {
  id: string;
  name: string;
  categoryId?: string;
  categoryName?: string;
  imageUrl?: string;
  isVegetarian?: boolean;
}): DishVisualMeta {
  const nameLower = dish.name.toLowerCase();
  const catLower = (dish.categoryName || dish.categoryId || '').toLowerCase();

  // If dish has a user-defined/admin image and it's valid, use that
  let resolvedImage = dish.imageUrl;

  // Otherwise, intelligently map to corresponding gourmet food photograph
  if (!resolvedImage) {
    // 1. Seafood dishes
    if (
      nameLower.includes('prawn') ||
      nameLower.includes('seabass') ||
      nameLower.includes('fish') ||
      nameLower.includes('trout') ||
      nameLower.includes('chada') ||
      nameLower.includes('mass')
    ) {
      resolvedImage = seafoodImg;
    }
    // 2. Biriyani
    else if (catLower.includes('biriyani') || nameLower.includes('biriyani')) {
      resolvedImage = biriyaniImg;
    }
    // 3. Tandoori & grilled meats/tikkas/kebabs
    else if (
      catLower.includes('tandoori') ||
      nameLower.includes('tikka') ||
      nameLower.includes('kebab') ||
      nameLower.includes('chops') ||
      nameLower.includes('shashlik') ||
      nameLower.includes('grill')
    ) {
      resolvedImage = tandoorImg;
    }
    // 4. Artisanal Naan, breads & sundries
    else if (
      catLower.includes('sundries') ||
      nameLower.includes('naan') ||
      nameLower.includes('roti') ||
      nameLower.includes('paratha') ||
      nameLower.includes('popadom') ||
      nameLower.includes('chutney')
    ) {
      resolvedImage = breadsImg;
    }
    // 5. Thali & Vegetarian side platters
    else if (
      catLower.includes('thali') ||
      catLower.includes('vegetable') ||
      nameLower.includes('thali') ||
      nameLower.includes('dall') ||
      nameLower.includes('aloo') ||
      nameLower.includes('sag') ||
      nameLower.includes('paneer')
    ) {
      resolvedImage = thaliImg;
    }
    // 6. Appetisers
    else if (catLower.includes('appetiser')) {
      if (nameLower.includes('tikka') || nameLower.includes('kebab') || nameLower.includes('chops')) {
        resolvedImage = tandoorImg;
      } else {
        resolvedImage = appetiserImg;
      }
    }
    // 7. Rice dishes
    else if (catLower.includes('rice') || nameLower.includes('rice')) {
      resolvedImage = biriyaniImg;
    }
    // 8. Sunday special feast
    else if (catLower.includes('sunday') || nameLower.includes('sunday')) {
      resolvedImage = feastImg;
    }
    // 9. Curries (Balti, Hash, Keema, Korai, Specials, Classics)
    else {
      resolvedImage = curryImg;
    }
  }

  // Determine spice level
  let spiceLevel: 'mild' | 'medium' | 'hot' = 'medium';
  if (
    nameLower.includes('korma') ||
    nameLower.includes('butter chicken') ||
    nameLower.includes('makani') ||
    nameLower.includes('passanda') ||
    nameLower.includes('mulligatawny') ||
    nameLower.includes('kashmiri') ||
    nameLower.includes('peshwari') ||
    nameLower.includes('raita')
  ) {
    spiceLevel = 'mild';
  } else if (
    nameLower.includes('vindaloo') ||
    nameLower.includes('madras') ||
    nameLower.includes('nagga') ||
    nameLower.includes('chilli') ||
    nameLower.includes('jalfrezi') ||
    nameLower.includes('acheri') ||
    nameLower.includes('pathia')
  ) {
    spiceLevel = 'hot';
  }

  // Determine pairing recommendation
  let pairing = 'Pairs beautifully with Garlic Naan and Pilau Rice';
  if (catLower.includes('tandoori') || nameLower.includes('tikka') || nameLower.includes('kebab')) {
    pairing = 'Best enjoyed with fresh Onion Salad and Peshwari Naan';
  } else if (catLower.includes('biriyani') || nameLower.includes('biriyani')) {
    pairing = 'Served with cooling Cucumber Raita and fresh Mixed Vegetable Curry';
  } else if (catLower.includes('seafood') || nameLower.includes('prawn') || nameLower.includes('seabass')) {
    pairing = 'Complements fragrant Lemon Rice or Steamed Basmati';
  } else if (catLower.includes('sundries') || nameLower.includes('naan')) {
    pairing = 'Perfect companion to our rich Clay-Oven Curries and Balti Sauces';
  } else if (spiceLevel === 'hot') {
    pairing = 'Cool your palate with our handcrafted Cucumber Raita or Mango Chutney';
  }

  // Tags
  const tags: string[] = [];
  if (dish.isVegetarian) tags.push('Vegetarian');
  if (nameLower.includes('special') || nameLower.includes('chef')) tags.push("Chef's Pick");
  if (catLower.includes('tandoori')) tags.push('Clay-Oven');
  if (spiceLevel === 'hot') tags.push('Spicy');
  if (spiceLevel === 'mild') tags.push('Mild & Creamy');

  return {
    imageUrl: resolvedImage || curryImg,
    spiceLevel,
    pairing,
    tags,
  };
}
