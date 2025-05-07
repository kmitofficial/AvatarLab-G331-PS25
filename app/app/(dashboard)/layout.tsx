// app/layout.tsx
import { AppSidebar } from "@/components/app-sidebar";
import { TopRightIcons } from "@/components/top-right";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"; // ensure correct import path
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className}`}>
        <SidebarProvider>
          <div className="flex h-screen w-screen">
            {/* Sidebar */}
            <AppSidebar />

            {/* Main Content */}
            <div className="flex flex-col flex-1 overflow-hidden">
              {/* Top Navbar */}
              <header className="h-14 w-full border-b border-stone-200 px-2 flex items-center justify-between">
                <div>
                <SidebarTrigger className=""/>
                <span className="ml-4 text-lg font-medium text-blue-600">Avatar Lab</span></div>
                <div><TopRightIcons/></div>
              </header>

              {/* Page Content */}
              <main className="flex-1 overflow-y-auto p-6">{children}</main>
            </div>
          </div>
        </SidebarProvider>
      </body>
    </html>
  );
}
