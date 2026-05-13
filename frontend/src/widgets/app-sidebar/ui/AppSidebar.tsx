import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  BadgeCheck,
  History,
  FileText,
  User,
  ChevronsUpDown,
  LogOut,
  CircleUserRound,
  Users,
  Building2,
  GraduationCap,
  UserPlus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AuthUser, UserRole } from "@/shared/auth/types";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { logout } from "@/pages/login/model/authApi";
import styles from "./AppSidebar.module.scss";

type AppSidebarProps = {
  user: AuthUser | null;
};

const items: Array<{
  to: string;
  title: string;
  icon: typeof LayoutDashboard;
  roles: UserRole[];
}> = [
  {
    to: "/home/dashboard",
    title: "Главная",
    icon: LayoutDashboard,
    roles: ["admin", "university"],
  },
  {
    to: "/home/universities",
    title: "Вузы",
    icon: Building2,
    roles: ["admin"],
  },
  {
    to: "/home/users",
    title: "Пользователи",
    icon: Users,
    roles: ["admin"],
  },
  {
    to: "/home/students",
    title: "Студенты",
    icon: GraduationCap,
    roles: ["university"],
  },
  {
    to: "/home/diplomas/create",
    title: "Создать диплом",
    icon: UserPlus,
    roles: ["university"],
  },
  {
    to: "/home/diplomas",
    title: "Дипломы",
    icon: FileText,
    roles: ["admin", "university"],
  },
  {
    to: "/home/my-diplomas",
    title: "Мои дипломы",
    icon: FileText,
    roles: ["student"],
  },
  {
    to: "/home/history",
    title: "Логи проверок",
    icon: History,
    roles: ["admin", "university"],
  },
  {
    to: "/home/verification",
    title: "Проверка диплома",
    icon: BadgeCheck,
    roles: ["admin", "university"],
  },
];

export function AppSidebar({ user }: AppSidebarProps) {
  const username = user?.username ?? "Загрузка...";
  const email = user?.email ?? "email не указан";

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/home");
    } catch (error) {
      console.error("Не удалось выйти из системы", error);
    }
  };

  const visibleItems = user
    ? items.filter((item) => item.roles.includes(user.role))
    : [];

  return (
    <Sidebar className={styles.sidebar}>
      <SidebarHeader className={styles.header}>
        <div className={styles.brand}>Diplomat</div>
      </SidebarHeader>

      <SidebarContent className={styles.content}>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => {
                const isActive = location.pathname === item.to;

                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={
                        isActive ? styles.menuButtonActive : styles.menuButton
                      }
                    >
                      <NavLink to={item.to}>
                        <item.icon className={styles.icon} />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className={styles.footer}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={styles.accountTrigger} type="button">
              <div className={styles.accountAvatar}>
                <User size={18} />
              </div>

              <div className={styles.accountInfo}>
                <div className={styles.accountName}>{username}</div>
                <div className={styles.accountEmail}>{email}</div>
              </div>

              <ChevronsUpDown className={styles.accountChevron} />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side="top"
            align="end"
            sideOffset={12}
            className={styles.accountMenu}
          >
            <DropdownMenuLabel className={styles.accountMenuHeader}>
              <div className={styles.accountAvatarLarge}>
                <User size={18} />
              </div>

              <div className={styles.accountMenuInfo}>
                <div className={styles.accountName}>{username}</div>
                <div className={styles.accountEmail}>{email}</div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className={styles.accountMenuItem}
              onClick={() => navigate("/home/account")}
            >
              <CircleUserRound className={styles.dropdownIcon} />
              <span>Аккаунт</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className={styles.accountMenuItem}
              onClick={handleLogout}
            >
              <LogOut className={styles.dropdownIcon} />

              <span>Выйти</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
