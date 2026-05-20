import { useEffect, useMemo, useState } from "react";
import { authApi, tripsApi } from "./api.js";
import { AuthForm } from "./features/auth/AuthForm.jsx";
import { AccountModal } from "./features/auth/UserMenu.jsx";
import { EmailConfirmationPage } from "./features/auth/EmailConfirmationPage.jsx";
import { Detail } from "./features/trips/Detail.jsx";
import { Home } from "./features/trips/Home.jsx";
import { ItineraryPage } from "./features/trips/ItineraryPage.jsx";
import { TripForm } from "./features/trips/TripForm.jsx";

const authStorageKey = "viajario-auth";

export function App() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [view, setView] = useState("home");
  const [formReturnView, setFormReturnView] = useState("home");
  const [activeTab, setActiveTab] = useState("proximas");
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [error, setError] = useState("");
  const [authMode, setAuthMode] = useState("login");
  const [authUser, setAuthUser] = useState(null);
  const [authToken, setAuthToken] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountError, setAccountError] = useState("");
  const [accountMessage, setAccountMessage] = useState("");

  const selectedTripFromList = useMemo(() => {
    if (!selectedTrip?.id) return selectedTrip;
    return trips.find((trip) => trip.id === selectedTrip.id) || selectedTrip;
  }, [selectedTrip, trips]);

  async function loadTrips(token = authToken) {
    setLoading(true);
    setError("");

    try {
      setTrips(await tripsApi.list(token));
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function restoreSession() {
      const rawSession = localStorage.getItem(authStorageKey);

      if (!rawSession) {
        setLoading(false);
        setSessionLoading(false);
        return;
      }

      try {
        const session = JSON.parse(rawSession);
        setAuthUser(session.user || null);
        setAuthToken(session.token || "");

        const response = await authApi.me(session.token);
        setAuthUser(response.user);
        setAuthToken("");
        localStorage.setItem(authStorageKey, JSON.stringify({ user: response.user }));
        await loadTrips();
      } catch (apiError) {
        setError(apiError.message || "Não foi possível atualizar a sessão agora.");
        setLoading(false);
      } finally {
        setSessionLoading(false);
      }
    }

    restoreSession();
  }, []);

  async function handleAuthenticated(user, _token) {
    setAuthUser(user);
    setAuthToken("");
    localStorage.setItem(authStorageKey, JSON.stringify({ user }));
    setAuthError("");
    await loadTrips();
  }

  function handleEmailConfirmed(user) {
    setAuthUser(user);
    setAuthToken("");
    localStorage.setItem(authStorageKey, JSON.stringify({ user }));
    loadTrips();
  }

  function handleLogout() {
    authApi.logout().catch(() => {});
    localStorage.removeItem(authStorageKey);
    setAuthUser(null);
    setAuthToken("");
    setTrips([]);
    setSelectedTrip(null);
    setView("home");
    setError("");
    setAuthError("");
    setAuthLoading(false);
  }

  async function finalizeTrip(id) {
    await tripsApi.finalize(id, authToken);
    await loadTrips();
  }

  async function updateTrip(id, payload) {
    const saved = await tripsApi.update(id, payload, authToken);
    setTrips((currentTrips) => currentTrips.map((trip) => (trip.id === id ? saved : trip)));
    setSelectedTrip(saved);
    return saved;
  }

  async function createDiaryEntry(tripId, entry) {
    await tripsApi.diaryCreate(tripId, entry, authToken);
    await loadTrips();
  }

  async function updateDiaryEntry(tripId, entryId, entry) {
    await tripsApi.diaryUpdate(tripId, entryId, entry, authToken);
    await loadTrips();
  }

  async function deleteDiaryEntry(tripId, entryId) {
    await tripsApi.diaryRemove(tripId, entryId, authToken);
    await loadTrips();
  }

  function openTrip(trip) {
    setSelectedTrip(trip);
    setView("detail");
  }

  function editTrip(trip) {
    setSelectedTrip(trip);
    setFormReturnView(view === "detail" ? "detail" : "home");
    setView("form");
  }

  async function handleSaved(trip) {
    await loadTrips();
    setSelectedTrip(trip);
    setView("detail");
  }

  function cancelForm() {
    setView(selectedTrip && formReturnView === "detail" ? "detail" : "home");
  }

  async function submitLogin(form) {
    setAuthLoading(true);
    setAuthError("");

    try {
      const response = await authApi.login({
        email: form.email,
        password: form.password
      });

      await handleAuthenticated(response.user, response.token);
    } catch (apiError) {
      setAuthError(apiError.message);
    } finally {
      setAuthLoading(false);
    }
  }

  async function submitRegister(form) {
    setAuthLoading(true);
    setAuthError("");

    try {
      const response = await authApi.register({
        name: form.name,
        email: form.email,
        password: form.password,
        passwordConfirmation: form.passwordConfirmation
      });

      await handleAuthenticated(response.user, response.token);
    } catch (apiError) {
      setAuthError(apiError.message);
    } finally {
      setAuthLoading(false);
    }
  }

  async function updateAccount(form) {
    setAccountLoading(true);
    setAccountError("");
    setAccountMessage("");

    try {
      const payload = {
        name: form.name,
        email: form.email,
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
        newPasswordConfirmation: form.newPasswordConfirmation
      };
      const response = await authApi.updateMe(payload);
      setAuthUser(response.user);
      localStorage.setItem(authStorageKey, JSON.stringify({ user: response.user }));
      setAccountMessage("Conta atualizada.");
    } catch (apiError) {
      setAccountError(apiError.message);
    } finally {
      setAccountLoading(false);
    }
  }

  async function resendVerification() {
    setAccountLoading(true);
    setAccountError("");
    setAccountMessage("");

    try {
      const response = await authApi.resendVerification();
      setAccountMessage(response.message);
    } catch (apiError) {
      setAccountError(apiError.message);
    } finally {
      setAccountLoading(false);
    }
  }

  if (window.location.pathname === "/confirmar-email") {
    return <EmailConfirmationPage onConfirmed={handleEmailConfirmed} />;
  }

  if (sessionLoading) {
    return (
      <main className="auth-page">
        <section className="auth-shell">
          <div className="auth-copy">
            <span className="eyebrow">Viajário</span>
            <h1>Carregando sua sessão.</h1>
          </div>
          <div className="panel auth-card">
            <p>Reconectando sua conta...</p>
          </div>
        </section>
      </main>
    );
  }

  if (!authUser) {
    return (
      <AuthForm
        mode={authMode}
        onToggleMode={setAuthMode}
        onLogin={submitLogin}
        onRegister={submitRegister}
        loading={authLoading}
        error={authError}
      />
    );
  }

  return (
    <main className="page">
      {error ? <p className="global-error">{error}</p> : null}
      {view === "home" ? (
        <Home
          trips={trips}
          loading={loading}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          user={authUser}
          onLogout={handleLogout}
          onAccount={() => {
            setAccountError("");
            setAccountMessage("");
            setAccountOpen(true);
          }}
          onNew={() => {
            setSelectedTrip(null);
            setFormReturnView("home");
            setView("form");
          }}
          onOpen={openTrip}
          onEdit={editTrip}
          onFinalize={finalizeTrip}
        />
      ) : null}
      {view === "form" ? (
        <TripForm
          selectedTrip={selectedTripFromList}
          token={authToken}
          onCancel={cancelForm}
          onSaved={handleSaved}
        />
      ) : null}
      {view === "detail" && selectedTripFromList ? (
        <Detail
          trip={selectedTripFromList}
          onBack={() => setView("home")}
          onEdit={editTrip}
          onFinalize={finalizeTrip}
          onUpdateTrip={updateTrip}
          onCreateDiaryEntry={createDiaryEntry}
          onUpdateDiaryEntry={updateDiaryEntry}
          onDeleteDiaryEntry={deleteDiaryEntry}
          onOpenItinerary={() => setView("itinerary")}
        />
      ) : null}
      {view === "itinerary" && selectedTripFromList ? (
        <ItineraryPage
          trip={selectedTripFromList}
          onBack={() => setView("detail")}
        />
      ) : null}
      {accountOpen ? (
        <AccountModal
          user={authUser}
          loading={accountLoading}
          error={accountError}
          message={accountMessage}
          onClose={() => setAccountOpen(false)}
          onSave={updateAccount}
          onResendVerification={resendVerification}
        />
      ) : null}
    </main>
  );
}
