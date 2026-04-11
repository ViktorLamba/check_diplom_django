import styles from "./LoginPage.module.scss";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormValues } from "../model/loginSchema";
import { login, verifyLogin } from "../model/authApi";
import { useState } from "react";
import {
  verifyCodeSchema,
  type VerifyCodeFormValues,
} from "../model/verifyCodeSchema";
import { LoginForm } from "./LoginForm";
import { VerifyCodeForm } from "./VerifyCodeForm";
import { useNavigate } from "react-router-dom";

export function LoginPage() {
  const navigate = useNavigate();

  const [serverError, setServerError] = useState("");
  const [authStep, setAuthStep] = useState<"login" | "verify">("login");
  const [pendingUsername, setPendingUsername] = useState("");
  const [debugCode, setDebugCode] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset: resetLoginForm,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  const {
    register: registerVerify,
    handleSubmit: handleSubmitVerify,
    formState: { errors: verifyErrors },
    reset: resetVerifyForm,
  } = useForm<VerifyCodeFormValues>({
    resolver: zodResolver(verifyCodeSchema),
    defaultValues: {
      code: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setServerError("");

      const response = await login({
        username: data.username,
        password: data.password,
      });

      console.log("Login response:", response);

      if ("requires_2fa" in response && response.requires_2fa) {
        setServerError("");
        setAuthStep("verify");
        setPendingUsername(response.username);
        setDebugCode(response.code_debug ?? "");
        resetVerifyForm();
        return;
      }

      if ("user" in response) {
        console.log("Успешный вход:", response.user);
        navigate("/home");
        return;
      }
    } catch (error) {
      if (error instanceof Error) {
        setServerError(error.message);
        return;
      }
      setServerError("Не удалось выполнить вход");
    }
  };

  const onVerifySubmit = async (data: VerifyCodeFormValues) => {
    try {
      setServerError("");

      const response = await verifyLogin({
        username: pendingUsername,
        code: data.code,
      });

      console.log("Вход подтвержден:", response.user);
      navigate("/home");
    } catch (error) {
      if (error instanceof Error) {
        setServerError(error.message);
        return;
      }
      setServerError("Не удалось подтвердить вход");
    }
  };

  const handleBackToLogin = () => {
    setServerError("");
    setAuthStep("login");
    setPendingUsername("");
    setDebugCode("");
    resetVerifyForm();
    resetLoginForm({
      username: pendingUsername,
      password: "",
      rememberMe: false,
    });
  };

  return (
    <main className={styles.page}>
      <div className={styles.grid} />
      <div className={styles.glowLeft} />
      <div className={styles.glowRight} />
      <div className={styles.glowTop} />

      <section className={styles.wrapper}>
        <div className={styles.brandTop}>Diplomat</div>
        <div className={styles.card}>
          <div className={styles.cardGlow} />
          <div className={styles.content}>
            <div className={styles.brandInside}>Diplomat</div>

            {authStep === "login" ? (
              <LoginForm
                register={register}
                handleSubmit={handleSubmit}
                onSubmit={onSubmit}
                errors={errors}
                serverError={serverError}
              />
            ) : (
              <VerifyCodeForm
                register={registerVerify}
                handleSubmit={handleSubmitVerify}
                onSubmit={onVerifySubmit}
                errors={verifyErrors}
                serverError={serverError}
                debugCode={debugCode}
                onBackToLogin={handleBackToLogin}
              />
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
