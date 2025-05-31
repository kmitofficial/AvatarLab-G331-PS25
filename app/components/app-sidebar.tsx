import { UserRound, AudioLines, Layers, FileVideo, HelpCircle, Trash, Send, Settings, Search, PenSquareIcon, PencilIcon } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarGroupLabel } from "@/components/ui/sidebar";
import Link from "next/link";

type MenuItem = {
  title: string;
  url: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const videos: MenuItem[] = [
  { title: "Workspace", url: "/workspace", icon: Layers },
  { title: "My Videos", url: "/videos", icon: FileVideo },
  { title: "Trash", url: "/trash", icon: Trash },
];

const premium: MenuItem[] = [
  { title: "Avatars", url: "/avatars", icon: UserRound },
  { title: "Voices", url: "/voices", icon: AudioLines },
  { title: "Edit Background", url: "/editbackground", icon: PencilIcon },
];

const others: MenuItem[] = [
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "Feedback", url: "/feedback", icon: Send },
  { title: "Help & Support", url: "/help&support", icon: HelpCircle },
];

export function AppSidebar() {
  const renderItems = (itemList: MenuItem[]) =>
    itemList.map(({ title, url, icon: Icon }) => (
      <SidebarMenuItem key={title} className="p-1">
        <SidebarMenuButton asChild>
          <Link
            href={url}
            className="flex items-center space-x-2 bg-white text-black hover:bg-gray-100 dark:bg-slate-800 dark:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
          >
            <Icon className="h-5 w-5" />
            <span className="font-medium" style={{ fontSize: '15px' }}>{title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ));

  return (
    <Sidebar>
      <SidebarHeader className="flex flex-row items-center justify-between px-4 py-2">
        <img src="logo.png" alt="Logo" height={50} width={50} className="object-contain" />
        <div className="flex flex-row gap-4">
          <Search size={20} />
          <PenSquareIcon size={20} />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="mt-2 text-stone-950 dark:text-white">Videos</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(videos)}</SidebarMenu>
          </SidebarGroupContent>

          <SidebarGroupLabel className="mt-2 text-stone-950 dark:text-white">Premium</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(premium)}</SidebarMenu>
          </SidebarGroupContent>

          <SidebarGroupLabel className="mt-2 text-stone-950 dark:text-white">Others</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(others)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}