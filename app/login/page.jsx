'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DEMO, loginUser } from '../../lib/data';

export default function Login() {
  const router = useRouter();
  const [err, setErr] = useState('');
  const submit = (e) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    if (f.email.trim().toLowerCase() === DEMO.email && f.password === DEMO.password) {
      loginUser({ email: DEMO.email, name: DEMO.name });
      router.push('/dashboard');
    } else setErr('Email or password is incorrect.');
  };
  return (
    <main className="login">
      <form className="panel form login-box" onSubmit={submit}>
        <a href="/" className="logo">Aurelian</a>
        <h1>Agent sign in</h1>
        <label>Email<input name="email" type="email" required autoComplete="username" defaultValue={DEMO.email} /></label>
        <label>Password<input name="password" type="password" required autoComplete="current-password" defaultValue={DEMO.password} /></label>
        {err && <p className="err" role="alert">{err}</p>}
        <button type="submit">Sign in</button>
        <p className="hint">Demo login is pre-filled. Replace with real authentication before launch.</p>
      </form>
    </main>
  );
}
