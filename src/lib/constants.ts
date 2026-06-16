export interface NavChild {
  label: string;
  href: string;
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  children?: NavChild[];
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
  { label: "POS Terminal", href: "/pos", icon: "point_of_sale" },
  {
    label: "Products",
    href: "/products",
    icon: "inventory_2",
    children: [
      { label: "All Products", href: "/products" },
      { label: "Add Product", href: "/products/add" },
      { label: "Low Stock", href: "/products/low-stock" },
    ],
  },
  { label: "Categories", href: "/categories", icon: "category" },
  {
    label: "Sales",
    href: "/sales",
    icon: "receipt_long",
    children: [
      { label: "All Sales", href: "/sales" },
      { label: "Quotations", href: "/sales/quotations" },
    ],
  },
  {
    label: "Purchases",
    href: "/purchases",
    icon: "shopping_cart",
    children: [
      { label: "Purchase Orders", href: "/purchases" },
      { label: "Suppliers", href: "/purchases/suppliers" },
    ],
  },
  { label: "Gift Cards", href: "/gift-cards", icon: "redeem" },
  {
    label: "Customers",
    href: "/customers",
    icon: "group",
    children: [
      { label: "All Customers", href: "/customers" },
      { label: "Add Customer", href: "/customers/add" },
      { label: "Warranty Tracker", href: "/customers/warranty" },
    ],
  },
  { label: "Settings", href: "/settings", icon: "settings" },
  {
    label: "Reports",
    href: "/reports/daily",
    icon: "assessment",
    children: [
      { label: "Daily Report", href: "/reports/daily" },
      { label: "Sales by Category", href: "/reports/category" },
      { label: "Stock Report", href: "/reports/stock" },
    ],
  },
];