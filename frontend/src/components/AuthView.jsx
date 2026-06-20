import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function AuthView() {
  const [email, setEmail] = useState('user-a@example.com');
  const [password, setPassword] = useState('password123456');
  const [busy, setBusy] = useState(false);

  async function signIn() {
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) alert(error.message);
  }

  async function signUp() {
    setBusy(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setBusy(false);
    if (error) alert(error.message);
    else alert('Signup created. If email confirmation is enabled, confirm email or disable it for testing.');
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="badge">Track B MVP</div>
        <h1>Eval Co-pilot</h1>
        <p>
          Build golden sets, grade AI outputs, expose failures, and prove improvement after a prompt or guardrail change.
        </p>

        <label>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} />

        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

        <div className="row">
          <button disabled={busy} onClick={signIn}>Sign in</button>
          <button disabled={busy} className="secondary" onClick={signUp}>Sign up</button>
        </div>

        <p className="hint">
          For Move 4, use two separate accounts and screenshot that each user only sees their own rows.
        </p>
      </section>
    </main>
  );
}
