"use client"
import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { TopRightIcons } from "./top-right";

export function MobileHeader() {
  const { isMobile, openMobile, setOpenMobile } = useSidebar();

  if (!isMobile) {
    return null;
  }

  return (
    <div className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-white px-4 dark:bg-gray-950/80 md:hidden">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => setOpenMobile(!openMobile)}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
        <div className="flex items-center gap-2 font-semibold text-blue-600 dark:text-blue-400">
          <span>{process.env.NEXT_PUBLIC_APP_NAME}</span>
        </div>
      </div>

      {/* TopRightIcons positioned at the extreme right */}
      <div className="flex items-center">
        <TopRightIcons />
      </div>
    </div>
  );
}
