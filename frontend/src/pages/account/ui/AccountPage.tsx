import { useAuth } from "@/shared/auth/AuthContext";
import type { AuthUser, UserRole } from "@/shared/auth/types";
import styles from "./AccountPage.module.scss";

const roleLabels: Record<UserRole, string> = {
  student: "Студент",
  university: "Представитель университета",
  admin: "Администратор",
};

function getRoleDetails(user: AuthUser | null) {
  if (!user) {
    return "Не указано";
  }

  if (user.role === "university") {
    return user.universityName ?? "Вуз не указан";
  }

  if (user.role === "student") {
    return user.studentName ?? "Студент не указан";
  }

  return "Полный доступ к системе";
}

export function AccountPage() {
  const { user, isLoading } = useAuth();

  const username = user?.username ?? "Не указано";
  const email = user?.email ?? "Не указано";
  const role = user?.role ? roleLabels[user.role] : "Не указано";
  const roleDetails = getRoleDetails(user);

  return (
    <section className={styles.page}>
      <div className={styles.card}>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Профиль</h2>

          <div className={styles.infoList}>
            <div className={styles.infoRow}>
              <span className={styles.label}>Имя пользователя</span>
              <span className={styles.value}>
                {isLoading ? "Загрузка..." : username}
              </span>
            </div>

            <div className={styles.infoRow}>
              <span className={styles.label}>Email</span>
              <span className={styles.value}>
                {isLoading ? "Загрузка..." : email}
              </span>
            </div>

            <div className={styles.infoRow}>
              <span className={styles.label}>Роль</span>
              <span className={styles.value}>
                {isLoading ? "Загрузка..." : role}
              </span>
            </div>

            <div className={styles.infoRow}>
              <span className={styles.label}>
                {user?.role === "university"
                  ? "Вуз"
                  : user?.role === "student"
                    ? "Студент"
                    : "Доступ"}
              </span>
              <span className={styles.value}>
                {isLoading ? "Загрузка..." : roleDetails}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Безопасность</h2>

          <div className={styles.infoList}>
            <div className={styles.infoRow}>
              <span className={styles.label}>Смена пароля</span>
              <span className={styles.valueMuted}>Скоро будет доступно</span>
            </div>

            <div className={styles.infoRow}>
              <span className={styles.label}>
                Управление безопасностью входа
              </span>
              <span className={styles.valueMuted}>Скоро будет доступно</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
