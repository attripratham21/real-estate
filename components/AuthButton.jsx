'use client';
import { useEffect, useState } from 'react';
import { getUser } from '../lib/data';

export default function AuthButton() {
  const [u, setU] = useState(null);
  useEffect(() => setU(getUser()), []);
  return <a className="btn-login" href={u ? '/dashboard' : '/login'}>{u ? 'Dashboard' : 'Login'}</a>;
}
