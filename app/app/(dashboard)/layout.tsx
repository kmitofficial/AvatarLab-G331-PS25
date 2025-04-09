import type React from "react";
import { Inter } from "next/font/google";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { MobileHeader } from "@/components/mobile-header";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SidebarProvider>
            <div className="flex-shrink-0">
              <AppSidebar />
            </div>
            <div className="flex flex-1 flex-col w-full">
              <div className="block lg:hidden">
                <MobileHeader />
              </div>
              <main className="flex-1 p-4 md:p-6">{children}</main>
            
            </div>   
        </SidebarProvider>
      </body>
    </html>
  );
}
