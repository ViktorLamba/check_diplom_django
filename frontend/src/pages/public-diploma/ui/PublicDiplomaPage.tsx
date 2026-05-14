import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import {
  getPublicDiploma,
  type Diploma,
} from "@/pages/diplomas/model/diplomasApi";
import styles from "./PublicDiplomaPage.module.scss";

export function PublicDiplomaPage() {
  const { publicId = "" } = useParams();
  const [diploma, setDiploma] = useState<Diploma | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<
    "verified" | "revoked" | "not_found" | null
  >(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const diplomaUrl = useMemo(
    () => `${window.location.origin}/diplom/${publicId}`,
    [publicId],
  );

  useEffect(() => {
    const loadDiploma = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await getPublicDiploma(publicId);

        setDiploma(response.diploma);
        setVerificationStatus(response.verificationStatus);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Не удалось загрузить диплом.",
        );
        setDiploma(null);
        setVerificationStatus(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (publicId) void loadDiploma();
  }, [publicId]);

  if (isLoading)
    return <main className={styles.page}>Загрузка диплома...</main>;
  if (error || !diploma)
    return <main className={styles.page}>{error || "Диплом не найден."}</main>;

  const isValid = verificationStatus === "verified";

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={isValid ? styles.statusValid : styles.statusRevoked}>
          {isValid
            ? "Диплом верифицирован"
            : "Диплом найден, но не является действующим"}
        </div>

        <h1 className={styles.title}>{diploma.number}</h1>

        <div className={styles.grid}>
          <div>
            <span>Владелец</span>
            <strong>{diploma.owner}</strong>
          </div>
          <div>
            <span>Вуз</span>
            <strong>{diploma.universityName}</strong>
          </div>
          <div>
            <span>Специальность</span>
            <strong>{diploma.speciality}</strong>
          </div>
          <div>
            <span>Квалификация</span>
            <strong>{diploma.qualification}</strong>
          </div>
          <div>
            <span>Дата выдачи</span>
            <strong>{diploma.issuedAt}</strong>
          </div>
        </div>

        <div className={styles.qrBlock}>
          <QRCodeSVG value={diplomaUrl} size={132} />
          <a className={styles.link} href={diplomaUrl}>
            {diplomaUrl}
          </a>
        </div>
      </section>
    </main>
  );
}
