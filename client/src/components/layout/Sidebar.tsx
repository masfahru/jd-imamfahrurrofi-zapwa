import { MainNav } from "@/components/layout/MainNav";
import { Zap } from 'lucide-react';

export function Sidebar() {
  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <a href="/admin" className="flex items-center gap-2 font-semibold">
            <Zap className="h-6 w-6" />
            <span className="">ZapWA</span>
          </a>
        </div>
        <div className="flex-1">
          <MainNav />
        </div>
        {/*<div className="mt-auto p-4">*/}
        {/*  <Card>*/}
        {/*    <CardHeader className="p-2 pt-0 md:p-4">*/}
        {/*      <CardTitle>Upgrade to Pro</CardTitle>*/}
        {/*      <CardDescription>*/}
        {/*        Unlock all features and get unlimited access to our support*/}
        {/*        team.*/}
        {/*      </CardDescription>*/}
        {/*    </CardHeader>*/}
        {/*    <CardContent className="p-2 pt-0 md:p-4 md:pt-0">*/}
        {/*      <Button size="sm" className="w-full">*/}
        {/*        Upgrade*/}
        {/*      </Button>*/}
        {/*    </CardContent>*/}
        {/*  </Card>*/}
        {/*</div>*/}
      </div>
    </div>
  );
}
