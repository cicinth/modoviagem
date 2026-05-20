import { useEffect, useState } from "react";
import { Field } from "../../components/formFields.jsx";

const emptyAccountForm = {
  name: "",
  email: "",
  currentPassword: "",
  newPassword: "",
  newPasswordConfirmation: ""
};

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";
}

export function AccountModal({ user, loading, error, message, onClose, onSave, onResendVerification }) {
  const [form, setForm] = useState(emptyAccountForm);

  useEffect(() => {
    setForm({
      ...emptyAccountForm,
      name: user?.name || "",
      email: user?.pendingEmail || user?.email || ""
    });
  }, [user]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    await onSave(form);
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Minha conta">
      <article className="modal-card account-modal">
        <div className="modal-header">
          <div>
            <h2>Minha conta</h2>
            <p>Atualize dados básicos e mantenha seu acesso seguro.</p>
          </div>
          <button className="modal-close-button" type="button" onClick={onClose} aria-label="Fechar">×</button>
        </div>

        {!user?.emailVerifiedAt || user?.pendingEmail ? (
          <div className="account-warning">
            <strong>E-mail pendente</strong>
            <span>{user.pendingEmail || user.email}</span>
            <button className="button ghost compact" type="button" onClick={onResendVerification} disabled={loading}>
              Reenviar link
            </button>
          </div>
        ) : null}

        {message ? <p className="form-success">{message}</p> : null}
        {error ? <p className="form-error">{error}</p> : null}

        <form className="account-form" onSubmit={submit}>
          <div className="form-grid two">
            <Field label="Nome">
              <input value={form.name} onChange={(event) => update("name", event.target.value)} />
            </Field>
            <Field label="E-mail">
              <input type="email" value={form.email} onChange={(event) => update("email", event.target.value)} />
            </Field>
          </div>

          <Field label="Senha atual">
            <input
              type="password"
              value={form.currentPassword}
              onChange={(event) => update("currentPassword", event.target.value)}
              placeholder="Obrigatória para trocar e-mail ou senha"
            />
          </Field>

          <div className="form-grid two">
            <Field label="Nova senha">
              <input
                type="password"
                value={form.newPassword}
                onChange={(event) => update("newPassword", event.target.value)}
                placeholder="Maiúscula, minúscula, número e símbolo"
              />
            </Field>
            <Field label="Confirmar nova senha">
              <input
                type="password"
                value={form.newPasswordConfirmation}
                onChange={(event) => update("newPasswordConfirmation", event.target.value)}
              />
            </Field>
          </div>

          <div className="actions">
            <button className="button primary" type="submit" disabled={loading}>{loading ? "Salvando..." : "Salvar alterações"}</button>
            <button className="button ghost" type="button" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </article>
    </div>
  );
}

export function UserMenu({ user, onAccount, onLogout }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="user-menu">
      <button className="user-menu-button" type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open}>
        <span>{initials(user?.name)}</span>
        <strong>{user?.name?.split(" ")[0] || "Conta"}</strong>
      </button>
      {open ? (
        <div className="user-menu-popover">
          <button type="button" onClick={() => { setOpen(false); onAccount(); }}>Minha conta</button>
          <button type="button" onClick={onLogout}>Sair</button>
        </div>
      ) : null}
    </div>
  );
}
