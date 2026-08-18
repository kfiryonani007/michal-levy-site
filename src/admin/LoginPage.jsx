import { useState } from 'react';
import { signIn } from '../lib/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error: err } = await signIn(email, password);
    setBusy(false);
    if (err) setError('אימייל או סיסמה שגויים.');
    // On success, useSession's onAuthStateChange updates the session and
    // AdminApp's routing swaps this page out — no manual redirect needed.
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-sm border border-accent bg-shell p-8"
      >
        <h1 className="text-xl font-normal">ניהול האתר</h1>
        <p className="mt-1 text-[0.8rem] text-ink/60">התחברות למיכל לוי</p>

        <label className="mt-7 block">
          <span className="mb-1 block text-[0.8rem] text-ink/70">אימייל</span>
          <input
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            dir="ltr"
            className="w-full rounded-sm border border-accent bg-white px-3 py-2 text-[0.95rem]
                       focus:border-clay focus:outline-none"
          />
        </label>

        <label className="mt-4 block">
          <span className="mb-1 block text-[0.8rem] text-ink/70">סיסמה</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            dir="ltr"
            className="w-full rounded-sm border border-accent bg-white px-3 py-2 text-[0.95rem]
                       focus:border-clay focus:outline-none"
          />
        </label>

        {error && <p className="mt-4 text-[0.85rem] text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="mt-7 w-full rounded-sm bg-clay py-2.5 text-[0.9rem] text-shell
                     transition-opacity disabled:opacity-50"
        >
          {busy ? 'מתחבר…' : 'התחברות'}
        </button>
      </form>
    </div>
  );
}
