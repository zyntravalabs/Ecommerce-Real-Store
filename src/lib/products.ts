export type Category = { id: string; name: string; color: string };
export type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number; // ₹, before GST
  discountPct: number;
  gstPct: number;
  stock: number;
  description: string;
  color: string; // pack colour
  shape: "box" | "bottle" | "round";
};

export const CATEGORIES: Category[] = [
  { id: "fruits", name: "Fruits & Vegetables", color: "#4caf50" },
  { id: "dairy", name: "Dairy Products", color: "#42a5f5" },
  { id: "snacks", name: "Snacks & Biscuits", color: "#ff9800" },
  { id: "beverages", name: "Beverages", color: "#e53935" },
  { id: "rice", name: "Rice & Groceries", color: "#a1887f" },
  { id: "personal", name: "Personal Care", color: "#ec407a" },
  { id: "cleaning", name: "Household Cleaning", color: "#26c6da" },
  { id: "electronics", name: "Electronics", color: "#546e7a" },
  { id: "bakery", name: "Bakery", color: "#d4a259" },
];

const p = (
  id: string, name: string, brand: string, category: string, price: number,
  discountPct: number, gstPct: number, stock: number, description: string,
  color: string, shape: Product["shape"] = "box",
): Product => ({ id, name, brand, category, price, discountPct, gstPct, stock, description, color, shape });

export const PRODUCTS: Product[] = [
  p("apple", "Shimla Apples 1kg", "FreshFarm", "fruits", 180, 10, 0, 40, "Crisp red apples from Himachal.", "#c62828", "round"),
  p("banana", "Robusta Bananas 12pc", "FreshFarm", "fruits", 60, 0, 0, 60, "Ripe, sweet bananas.", "#fdd835", "round"),
  p("tomato", "Tomatoes 1kg", "FreshFarm", "fruits", 40, 0, 0, 8, "Juicy farm tomatoes.", "#e53935", "round"),
  p("onion", "Onions 1kg", "FreshFarm", "fruits", 35, 0, 0, 80, "Everyday cooking onions.", "#8e24aa", "round"),
  p("milk", "Toned Milk 1L", "Amul", "dairy", 60, 0, 0, 50, "Fresh pasteurised toned milk.", "#e3f2fd", "bottle"),
  p("curd", "Fresh Curd 400g", "Nandini", "dairy", 45, 0, 5, 30, "Thick and creamy dahi.", "#ffffff"),
  p("paneer", "Malai Paneer 200g", "Amul", "dairy", 90, 5, 5, 6, "Soft cottage cheese.", "#fff8e1"),
  p("butter", "Salted Butter 100g", "Amul", "dairy", 56, 0, 12, 25, "Utterly butterly delicious.", "#ffeb3b"),
  p("chips", "Classic Salted Chips", "Lay's", "snacks", 20, 0, 12, 90, "Crunchy potato chips.", "#ffc107"),
  p("biscuit", "Glucose Biscuits", "Parle-G", "snacks", 10, 0, 18, 120, "India's favourite biscuit.", "#ffb300"),
  p("namkeen", "Aloo Bhujia 400g", "Haldiram's", "snacks", 105, 10, 12, 35, "Spicy crispy namkeen.", "#d84315"),
  p("cookies", "Choco Chip Cookies", "Good Day", "snacks", 40, 0, 18, 45, "Loaded with choco chips.", "#5d4037"),
  p("cola", "Cola 750ml", "Thums Up", "beverages", 40, 0, 28, 70, "Strong fizzy cola.", "#b71c1c", "bottle"),
  p("juice", "Mango Juice 1L", "Maaza", "beverages", 99, 15, 12, 30, "Thick mango drink.", "#ff9800", "bottle"),
  p("water", "Mineral Water 1L", "Bisleri", "beverages", 20, 0, 18, 150, "Purified drinking water.", "#4fc3f7", "bottle"),
  p("tea", "Premium Tea 250g", "Tata Tea", "beverages", 140, 5, 5, 40, "Rich, strong chai.", "#2e7d32"),
  p("rice", "Basmati Rice 1kg", "India Gate", "rice", 100, 0, 5, 60, "Long-grain aged basmati.", "#1565c0"),
  p("atta", "Whole Wheat Atta 5kg", "Aashirvaad", "rice", 260, 8, 5, 25, "Soft rotis every day.", "#ef6c00"),
  p("dal", "Toor Dal 1kg", "Tata Sampann", "rice", 160, 0, 0, 5, "Unpolished pigeon peas.", "#f9a825"),
  p("oil", "Sunflower Oil 1L", "Fortune", "rice", 150, 10, 5, 40, "Light, healthy cooking oil.", "#fbc02d", "bottle"),
  p("soap", "Bathing Soap 4pc", "Dove", "personal", 180, 10, 18, 40, "Moisturising beauty bar.", "#f5f5f5"),
  p("shampoo", "Anti-Dandruff Shampoo", "Head & Shoulders", "personal", 199, 0, 18, 20, "Clean, flake-free hair.", "#0277bd", "bottle"),
  p("paste", "Toothpaste 150g", "Colgate", "personal", 95, 0, 18, 50, "Strong teeth, fresh breath.", "#d32f2f"),
  p("detergent", "Detergent Powder 1kg", "Surf Excel", "cleaning", 140, 5, 18, 30, "Tough stain removal.", "#1e88e5"),
  p("dishwash", "Dishwash Gel 500ml", "Vim", "cleaning", 110, 0, 18, 35, "Lemon-powered grease cutter.", "#7cb342", "bottle"),
  p("floor", "Floor Cleaner 1L", "Lizol", "cleaning", 199, 15, 18, 4, "Kills 99.9% germs.", "#6a1b9a", "bottle"),
  p("earbuds", "Wireless Earbuds", "boAt", "electronics", 1499, 20, 18, 10, "Bluetooth 5.3, 40h playback.", "#212121"),
  p("charger", "Fast Charger 20W", "Mi", "electronics", 599, 0, 18, 15, "USB-C fast charging.", "#fafafa"),
  p("bulb", "LED Bulb 9W", "Philips", "electronics", 99, 0, 12, 50, "Bright, energy saving.", "#fff59d"),
  p("bread", "Whole Wheat Bread", "Modern", "bakery", 50, 0, 0, 25, "Freshly baked sliced bread.", "#a1887f"),
  p("cake", "Chocolate Cake 400g", "Monginis", "bakery", 250, 10, 18, 7, "Rich chocolate sponge.", "#4e342e"),
  p("rusk", "Toast Rusk", "Britannia", "bakery", 45, 0, 5, 40, "Crunchy tea-time rusk.", "#c8a165"),
];

export const productById = (id: string) => PRODUCTS.find((x) => x.id === id);
export const unitPrice = (pr: Product) => Math.round(pr.price * (1 - pr.discountPct / 100) * 100) / 100;
