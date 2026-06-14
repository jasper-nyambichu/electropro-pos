export interface NavItem {
  label: string;
  href: string;
  icon: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
  { label: "POS Terminal", href: "/pos", icon: "point_of_sale" },
  { label: "Products", href: "/products", icon: "inventory_2" },
  { label: "Categories", href: "/categories", icon: "category" },
  { label: "Sales", href: "/sales", icon: "receipt_long" },
  { label: "Purchases", href: "/purchases", icon: "shopping_cart" },
  { label: "Gift Cards", href: "/gift-cards", icon: "redeem" },
  { label: "Customers", href: "/customers", icon: "group" },
  { label: "Settings", href: "/settings", icon: "settings" },
  { label: "Reports", href: "/reports/daily", icon: "assessment" },
];

export const ITEMS_WITH_CHILDREN = [
  "Products",
  "Categories",
  "Sales",
  "Purchases",
  "Gift Cards",
  "Customers",
  "Reports",
];