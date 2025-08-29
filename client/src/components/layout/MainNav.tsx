import { NavLink } from "react-router";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

export function MainNav() {
  const navItems = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: Icons.dashboard,
    },
    {
      title: "Users",
      href: "/admin/users",
      icon: Icons.users,
    },
    {
      title: "Settings",
      href: "/admin/settings",
      icon: Icons.settings,
    },
  ];

  return (
    <nav className="grid items-start gap-2 px-2 text-sm font-medium lg:px-4">
      {navItems.map((item) => (
        <NavLink
          key={item.title}
          to={item.href}
          end // Use 'end' for the Dashboard link to avoid it being active on child routes
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
              isActive && "bg-muted text-primary",
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
