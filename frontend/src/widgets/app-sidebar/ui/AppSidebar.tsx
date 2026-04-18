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
  Settings,
  User,
  ChevronsUpDown,
  LogOut,
  CircleUserRound,
  Cog,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import styles from "./AppSidebar.module.scss";

export type SidebarSection =
  | "dashboard"
  | "verification"
  | "history"
  | "diplomas"
  | "settings";

type AppSidebarProps = {
  activeSection: SidebarSection;
  onSectionChange: (section: SidebarSection) => void;
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
  { key: "settings", title: "Настройки", icon: Settings },
];

export function AppSidebar({
  activeSection,
  onSectionChange,
}: AppSidebarProps) {
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
                <div className={styles.accountName}>username</div>
                <div className={styles.accountEmail}>user@example.com</div>
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
                <div className={styles.accountName}>username</div>
                <div className={styles.accountEmail}>user@example.com</div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem className={styles.accountMenuItem}>
              <CircleUserRound className={styles.dropdownIcon} />
              <span>Аккаунт</span>
            </DropdownMenuItem>

            <DropdownMenuItem className={styles.accountMenuItem}>
              <Cog className={styles.dropdownIcon} />
              <span>Настройки</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem className={styles.accountMenuItem}>
              <LogOut className={styles.dropdownIcon} />
              <span>Выйти</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
