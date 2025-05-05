import type React from "react";
import { Inter } from "next/font/google";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { MobileHeader } from "@/components/mobile-header";
import { TopRightIcons } from "@/components/top-right";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SidebarProvider>
          <div className="flex h-screen w-full">
            {/* Sidebar */}
            <div className="flex-shrink-0">
              <AppSidebar />
            </div>
            
            {/* Main content area with header - using flex-1 to fill available space */}
            <div className="flex flex-1 flex-col w-full relative">
              {/* Absolute positioned header for top-right icons */}
              <div className="absolute top-2 right-2 flex items-center h-16 px-6 z-10">
                <TopRightIcons/>
              </div>
              
              {/* Mobile Header - only visible on small screens */}
              <div className="block lg:hidden">
                <MobileHeader />
              </div>
              
              {/* Main content - will expand to fill available width */}
              <main className="flex-1 w-full p-4 md:p-6 overflow-auto">{children}</main>
            </div>
          </div>
        </SidebarProvider>
      </body>
    </html>
  );
}