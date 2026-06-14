import SidebarLink from "./SidebarLink";
import { NAV_ITEMS, ITEMS_WITH_CHILDREN } from "@/lib/constants";

export default function SideBar() {
  return (
    <aside className="fixed left-0 top-[50px] w-[220px] h-[calc(100vh-50px)] bg-secondary text-on-secondary hidden md:flex flex-col overflow-y-auto custom-scrollbar">
      <div className="flex flex-col py-2">
        {NAV_ITEMS.map((item) => (
          <SidebarLink
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            hasChildren={ITEMS_WITH_CHILDREN.includes(item.label)}
          />
        ))}
      </div>
    </aside>
  );
}