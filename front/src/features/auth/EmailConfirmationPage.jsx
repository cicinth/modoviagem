import { useEffect, useMemo, useState } from "react";
import { authApi } from "../../api.js";

export function EmailConfirmationPage({ onConfirmed }) {
  const token = useMemo(() => new URLSearchParams(window.location.search).get("token") || "", []);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Confirmando seu e-mail...");

  useEffect(() => {
    async function confirm() {
      try {
        const response = await authApi.confirmEmail(token);
        setStatus("success");
        setMessage("E-mail confirmado. Sua conta está pronta.");
        onConfirmed(response.user);
      } catch (error) {
        setStatus("error");
        setMessage(error.message);
      }
    }

    confirm();
  }, [onConfirmed, token]);

  return (
    <main className="auth-page">
      <section className="auth-shell confirm-shell">
        <div className="auth-copy">
          <span className="eyebrow">Viajário</span>
          <h1>{status === "success" ? "E-mail confirmado." : "Confirmação de e-mail."}</h1>
          <p>{message}</p>
          <button className="button primary" type="button" onClick={() => { window.location.href = "/"; }}>
            Voltar ao Viajário
          </button>
        </div>
      </section>
    </main>
  );
}
