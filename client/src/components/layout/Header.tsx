import { Menu } from "lucide-react";
import { useNavigate } from "react-router";
import { MainNav } from "@/components/layout/MainNav";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuthStore } from "@/lib/authStore";
import { Beaver } from "@/assets/beaver";

export function Header() {
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col">
          <nav className="grid gap-2 text-lg font-medium">
            <a
              href="#"
              className="flex items-center gap-2 text-lg font-semibold"
            >
              <Beaver className="h-6 w-6" />
              <span className="">BHVR</span>
            </a>
            <MainNav />
          </nav>
        </SheetContent>
      </Sheet>
      <div className="w-full flex-1">
        {/* You can add a search bar here if needed */}
      </div>
      <div>
				<span className="mr-4 text-sm">
					Welcome, <b>{user?.name || "Admin"}</b>!
				</span>
        <Button onClick={handleLogout} variant="outline" size="sm">
          Logout
        </Button>
      </div>
    </header>
  );
}
