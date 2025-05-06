import { Layers, FileVideo, AudioLines,UserRound,HelpCircle, Trash, Send, Settings} from "lucide-react";
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
  {title: "Create Avatar",url: "/createAvatar",icon:UserRound },
  {title: "Create Voice",url: "/createVoice",icon:AudioLines },
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
          <Link href={url} className="flex items-center space-x-2">
            <Icon className="h-5 w-5" />
            <span className="font-medium text-stone-700" style={{fontSize:'15px'}}>{title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ));

  return (
    <Sidebar>
      <SidebarHeader className="flex flex-row p-4">
        <span className="text-2xl font-semibold">{process.env.NEXT_PUBLIC_APP_NAME}</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>

          <SidebarGroupLabel className="mt-2 text-stone-950">Videos</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(videos)}</SidebarMenu>
          </SidebarGroupContent>

          <SidebarGroupLabel className="mt-2 text-stone-950">Premium</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(premium)}</SidebarMenu>
          </SidebarGroupContent>
          

          <SidebarGroupLabel className="mt-2 text-stone-950">Others</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(others)}</SidebarMenu>
          </SidebarGroupContent>
          
        </SidebarGroup> 
      </SidebarContent>
    </Sidebar>
  );
}
