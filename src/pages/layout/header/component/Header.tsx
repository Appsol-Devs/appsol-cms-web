"use client";

import { Search, Menu, Settings, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Sidebar from "../../sidebar/component/Sidebar";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import Notifications from "../../notification/component/Notifications";
import SidebarToggler from "../../sidebar/component/SidebarToggler";

function Header() {
  const activeUser = useSelector((state: RootState) => state.user);
  const isCollapsed: boolean = useSelector(
    (state: RootState) => state.sidebar.isSidebarToggled,
  );
  const getInitials = () => {
    const userData = activeUser;

    if (!userData) return "U";

    if (userData.user?.firstName && userData.user.lastName) {
      return `${userData.user.firstName[0]}${userData.user.lastName[0]}`.toUpperCase();
    }

    return "U";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <Sidebar />
            </SheetContent>
          </Sheet>

          <SidebarToggler show={isCollapsed} />

          <div className="text-xl lg:hidden font-bold tracking-tight animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="p-2">
              <img
                className="h-7"
                src="/assets/images/logo/appsol_cmslight.png"
                alt="Appsol Logo Light mode"
              />
            </div>
          </div>
        </div>

        <div className="hidden md:flex w-full max-w-md items-center gap-2">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search content, users, media..."
              className="pl-9 rounded-2xl"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* <Button variant="ghost" size="icon" className="relative bg-transparent! border-onSurface!">
            <Bell className="h-5 w-5 text-onSurface hover:text-foreground transition-colors" />
            {notifications > 0 && (
              <Badge
                variant="destructive"
                className="absolute -right-0.5 -top-0.5 h-4 w-4 rounded-full p-0 flex items-center justify-center text-[10px] border-2 border-background "
              >
                {notifications}
              </Badge>
            )}
          </Button> */}
          <Notifications />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-9 w-9 rounded-full p-0 bg-primary!"
              >
                <Avatar className="h-5 w-5">
                  <AvatarImage src="/avatar.png" alt="User" />
                  <AvatarFallback className="text-white bg-primary">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-500 cursor-pointer hover:bg-red-50 dark:hover:bg-red-950">
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export default Header;
