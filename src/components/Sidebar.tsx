"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Search, Wrench, ClipboardList, BookOpen } from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/analyzer", label: "Listing Analyzer", icon: Search },
  { href: "/fault-finder", label: "Fault Finder", icon: Wrench },
  { href: "/tracker", label: "Flip Tracker", icon: ClipboardList },
  { href: "/prices", label: "Price Reference", icon: BookOpen },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-gray-900 border-r border-gray-800 flex flex-col z-50">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-black font-bold text-sm">F</div>
          <div>
            <div className="font-bold text-white text-sm">FlipIQ</div>
            <div className="text-xs text-gray-400">Electronics Flipper</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-green-500/10 text-green-400 font-medium"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-800">
        <div className="text-xs text-gray-500 text-center">Buy low. Fix fast. Sell smart.</div>
      </div>
    </aside>
  );
}
