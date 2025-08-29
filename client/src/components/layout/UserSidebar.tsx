import { Zap } from 'lucide-react';
import { UserMainNav } from './UserMainNav';

export function UserSidebar() {
  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <a href="/dashboard" className="flex items-center gap-2 font-semibold">
            <Zap className="h-6 w-6" />
            <span className="">ZapWA</span>
          </a>
        </div>
        <div className="flex-1">
          <UserMainNav />
        </div>
      </div>
    </div>
  );
}
