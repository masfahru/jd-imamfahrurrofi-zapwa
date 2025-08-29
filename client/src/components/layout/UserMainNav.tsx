import { NavLink } from "react-router";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

export function UserMainNav() {
  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Icons.dashboard,
    },
    {
      title: "Products",
      href: "/dashboard/products",
      icon: Icons.products,
    },
    {
      title: "Orders",
      href: "/dashboard/orders",
      icon: Icons.orders,
    },
    {
      title: "AI Agents",
      href: "/dashboard/ai-agents",
      icon: Icons.aiAgents,
    },
  ];

  return (
    <nav className="grid items-start gap-2 px-2 text-sm font-medium lg:px-4">
      {navItems.map((item) => (
        <NavLink
          key={item.title}
          to={item.href}
          end={item.href === "/dashboard"}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
              isActive && "bg-muted text-primary"
            )
          }
        >
          <item.icon className="h-4 w-4" />
          {item.title}
        </NavLink>
      ))}
    </nav>
  );
}
