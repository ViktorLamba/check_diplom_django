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
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AuthUser } from "@/pages/login/model/authApi";
import { useNavigate } from "react-router-dom";
import { logout } from "@/pages/login/model/authApi";
import styles from "./AppSidebar.module.scss";

export type SidebarSection =
  | "dashboard"
  | "verification"
  | "history"
  | "diplomas"
  | "account";

type AppSidebarProps = {
  activeSection: SidebarSection;
  onSectionChange: (section: SidebarSection) => void;
  user: AuthUser | null;
};

const items: Array<{
  key: SidebarSection;
  title: string;
  icon: typeof LayoutDashboard;
}> = [
  { key: "dashboard", title: "Главная страница", icon: LayoutDashboard },
  { key: "verification", title: "Подтверждение диплома", icon: BadgeCheck },
  { key: "history", title: "История проверки", icon: History },
  { key: "diplomas", title: "Дипломы", icon: FileText },
];

export function AppSidebar({
  activeSection,
  onSectionChange,
  user,
}: AppSidebarProps) {
  const username = user?.username ?? "Загрузка...";
  const email = user?.email ?? "email не указан";

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Не удалось выйти из системы", error);
    }
  };
  return (
    <Sidebar className={styles.sidebar}>
      <SidebarHeader className={styles.header}>
        <div className={styles.brand}>Diplomat</div>
      </SidebarHeader>

      <SidebarContent className={styles.content}>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = item.key === activeSection;

                return (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton
                      type="button"
                      onClick={() => onSectionChange(item.key)}
                      className={
                        isActive ? styles.menuButtonActive : styles.menuButton
                      }
                    >
                      <item.icon className={styles.icon} />
                      <span>{item.title}</span>
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
              onClick={() => onSectionChange("account")}
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
