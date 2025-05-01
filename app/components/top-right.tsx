"use client"

import { useEffect, useState } from "react"
import { Bell } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getEmail } from "@/lib/authenticate"


export function TopRightIcons() {
  const [notificationCount, setNotificationCount] = useState(0)
  const [details,setDetails] = useState({email:"",username:""})
  
  useEffect(() => {
    const getDetails = async () =>{
      const result = await getEmail();
      console.log(result)
      if(result) setDetails((prev) => ({...prev,email:result.email,username:result.username}));
    };
    getDetails();
  },[]);

  return (
    <div className="flex items-center gap-4">
      <div className="relative">

      </div>
      {/*Notifications*/}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full">
            <Bell className="h-5 w-5 text-gray-600" />
            {notificationCount > 0 && (
              <Badge className="absolute -right-1 -top-1 h-4 w-4 rounded-full p-0 flex items-center justify-center bg-red-500 text-white border-0 text-[10px]">
                {notificationCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="max-h-80 overflow-auto">
            <div className="p-2 text-sm hover:bg-muted rounded-md cursor-pointer">
              <p className="font-medium">Welcome to Avatar Lab!</p>
              <p className="text-muted-foreground text-xs">Get started by creating your first talking head video</p>
              <p className="text-xs text-blue-600 mt-1">1 day ago</p>
            </div>
          </div>
          <DropdownMenuSeparator />
          <Button variant="ghost" size="sm" className="w-full justify-center text-blue-600">
            Mark all as read
          </Button>
        </DropdownMenuContent>

      </DropdownMenu>

      {/*User Profile*/}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-blue-500 p-0 text-white">
            <span className="text-sm font-medium">J</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{details.username}</p>
              <p className="text-xs text-muted-foreground">{details.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <Link href="/settings">
            <DropdownMenuItem>Settings</DropdownMenuItem>
          </Link>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-red-600 focus:text-red-600">Log out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}