import { NavLink } from "react-router";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/authStore";

export function MainNav() {
  const { user } = useAuthStore();

  const navItems = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: Icons.dashboard,
      roles: ["admin", "super admin"],
    },
    {
      title: "Users",
      href: "/admin/users",
      icon: Icons.users,
      roles: ["admin", "super admin"],
    },
    {
      title: "Admins",
      href: "/admin/admins",
      icon: Icons.admins,
      roles: ["super admin"],
    },
  ];

  const accessibleNavItems = navItems.filter(
    (item) => user?.role && item.roles.includes(user.role)
  );

  return (
    <nav className="grid items-start gap-2 px-2 text-sm font-medium lg:px-4">
      {accessibleNavItems.map((item) => (
        <NavLink
          key={item.title}
          to={item.href}
          end={item.href === "/admin"}
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
