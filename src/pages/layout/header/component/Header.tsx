
import { useState } from "react";
import { Search, Menu, LogOut, User, CalendarClock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { allRoutes } from "@/utils/routes";
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
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store";
import Notifications from "../../notification/component/Notifications";
import SidebarToggler from "../../sidebar/component/SidebarToggler";
import { logoutUser } from "@/pages/auth/login/common/loginSlice";
import ConfirmationDialog from "@/components/ConfirmationDialog";

function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const activeUser = useSelector((state: RootState) => state.user);
  const isCollapsed: boolean = useSelector(
    (state: RootState) => state.sidebar.isSidebarToggled,
  );

  const handleUserLogout = () => {
    dispatch(logoutUser());
    localStorage.clear();
    navigate(allRoutes.LOGIN);
    console.log("User logged out successfully");
  };

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
          
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`relative bg-transparent! border-onSurface! transition-opacity duration-200 ${
                    isMobileMenuOpen ? "opacity-0 pointer-events-none" : "opacity-100"
                  }`}
                  aria-label="Open mobile menu"
                >
                  <Menu className="h-5 w-5 text-onSurface hover:text-foreground transition-colors" />
                </Button>
              </SheetTrigger>
              
              
              <SheetContent side="left" className="w-64 p-0 [&>button]:hidden">
                <Sidebar isMobile={true} onClose={() => setIsMobileMenuOpen(false)} />
              </SheetContent>
            </Sheet>
          </div>

          <div className="hidden md:flex">
            <SidebarToggler show={isCollapsed} />
          </div>

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
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="relative bg-transparent! border-onSurface!"
            aria-label="Open calendar"
            title="Calendar"
            onClick={() =>
              navigate(allRoutes.PORTAL + allRoutes.RESCHEDULES_SCHEDULER)
            }
          >
            <CalendarClock className="h-5 w-5 text-onSurface hover:text-foreground transition-colors" />
          </Button>
          <Notifications />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-9 w-9 rounded-full p-0 bg-primary!"
              >
                <Avatar className="h-5 w-5">
                  <AvatarImage
                    src={activeUser.user?.imageUrl || "/avatar.png"}
                    alt="User"
                  />
                  <AvatarFallback className="text-white bg-primary">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  navigate(`${allRoutes.PORTAL}${allRoutes.PROFILE}`)
                }
              >
                <User className="mr-2 h-4 w-4" /> Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />

              <ConfirmationDialog
                alertType="warning"
                title="Confirm Logout"
                rightActionTitle="Logout"
                content={
                  <p className="text-muted-foreground text-center">
                    Are you sure you want to log out of your account?
                  </p>
                }
                onConfirmClicked={handleUserLogout}
                trigger={
                  <DropdownMenuItem
                    className="text-red-500 cursor-pointer w-full hover:text-red-500!"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                }
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export default Header;