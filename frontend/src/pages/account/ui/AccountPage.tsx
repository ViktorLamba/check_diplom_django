import { useAuth } from "@/shared/auth/AuthContext";
import type { AuthUser, UserRole } from "@/shared/auth/types";
import { useState, type FormEvent } from "react";
import { changePassword } from "@/pages/login/model/authApi";

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

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);

  const handleChangePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!oldPassword || !newPassword || !newPasswordConfirm) {
      setPasswordError("Заполните все поля.");
      setPasswordMessage("");
      return;
    }

    try {
      setIsPasswordSubmitting(true);
      setPasswordError("");
      setPasswordMessage("");

      const response = await changePassword({
        oldPassword,
        newPassword,
        newPasswordConfirm,
      });

      setPasswordMessage(response.detail || "Пароль успешно изменён.");
      setOldPassword("");
      setNewPassword("");
      setNewPasswordConfirm("");
    } catch (error) {
      setPasswordError(
        error instanceof Error ? error.message : "Не удалось изменить пароль.",
      );
    } finally {
      setIsPasswordSubmitting(false);
    }
  };

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
          <div className={styles.infoList}>
            <form
              className={styles.passwordForm}
              onSubmit={handleChangePassword}
            >
              <h3 className={styles.formTitle}>Смена пароля</h3>

              <input
                className={styles.input}
                type="password"
                value={oldPassword}
                placeholder="Текущий пароль"
                onChange={(event) => setOldPassword(event.target.value)}
              />

              <input
                className={styles.input}
                type="password"
                value={newPassword}
                placeholder="Новый пароль"
                onChange={(event) => setNewPassword(event.target.value)}
              />

              <input
                className={styles.input}
                type="password"
                value={newPasswordConfirm}
                placeholder="Повторите новый пароль"
                onChange={(event) => setNewPasswordConfirm(event.target.value)}
              />

              {passwordError && (
                <p className={styles.errorText}>{passwordError}</p>
              )}
              {passwordMessage && (
                <p className={styles.successText}>{passwordMessage}</p>
              )}

              <button
                className={styles.primaryButton}
                type="submit"
                disabled={isPasswordSubmitting}
              >
                {isPasswordSubmitting ? "Сохранение..." : "Сменить пароль"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
