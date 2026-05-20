import { useState } from "react";
import { Field } from "../../components/formFields.jsx";

const initialForm = {
  name: "",
  email: "",
  password: "",
  passwordConfirmation: ""
};

export function AuthForm({ onLogin, onRegister, loading = false, error = "", onToggleMode, mode = "login" }) {
  const [form, setForm] = useState(initialForm);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (mode === "register") {
      await onRegister(form);
      return;
    }

    await onLogin(form);
  }

  return (
    <main className="auth-page">
      <section className="auth-shell">
        <div className="auth-copy">
          <span className="eyebrow">Viajário</span>
          <h1>Entre no seu diário de viagens.</h1>
          <p>Crie uma conta para guardar roteiro, fotos, tarefas e memórias em um só lugar.</p>
          <div className="auth-badges" aria-hidden="true">
            <span>roteiro em Markdown</span>
            <span>moodboard visual</span>
            <span>diário por cidade</span>
          </div>
        </div>

        <form className="panel auth-card" onSubmit={handleSubmit}>
          <div className="auth-toggle">
            <button
              className={mode === "login" ? "active" : ""}
              type="button"
              onClick={() => onToggleMode("login")}
            >
              Entrar
            </button>
            <button
              className={mode === "register" ? "active" : ""}
              type="button"
              onClick={() => onToggleMode("register")}
            >
              Criar conta
            </button>
          </div>

          <div className="auth-fields">
            {mode === "register" ? (
              <Field label="Nome">
                <input
                  value={form.name}
                  onChange={(event) => update("name", event.target.value)}
                  placeholder="Seu nome"
                />
              </Field>
            ) : null}
            <Field label="E-mail">
              <input
                type="email"
                value={form.email}
                onChange={(event) => update("email", event.target.value)}
                placeholder="voce@exemplo.com"
              />
            </Field>
            <Field label="Senha">
              <input
                type="password"
                value={form.password}
                onChange={(event) => update("password", event.target.value)}
                placeholder="Mínimo 8, com número e símbolo"
              />
            </Field>
            {mode === "register" ? (
              <Field label="Confirmar senha">
                <input
                  type="password"
                  value={form.passwordConfirmation}
                  onChange={(event) => update("passwordConfirmation", event.target.value)}
                  placeholder="Repita a senha"
                />
              </Field>
            ) : null}
          </div>

          {error ? <p className="form-error">{error}</p> : null}

          <div className="actions auth-actions">
            <button className="button primary" type="submit" disabled={loading}>
              {loading ? "Entrando..." : mode === "register" ? "Criar conta" : "Entrar"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
