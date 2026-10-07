'use client';
import { useState } from 'react';
import { addLead } from '../lib/data';

export default function Contact() {
  const [sent, setSent] = useState(false);
  const submit = (e) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    addLead({ name: f.name, phone: f.phone, interest: f.home }); // saved to the dashboard Leads tab (demo). Swap for your API/CRM.
    setSent(true);
  };
  if (sent) return <div className="panel"><h3>Request received</h3><p>An advisor will call you within one working day.</p></div>;
  return (
    <form className="panel form" onSubmit={submit}>
      <label>Full name<input required name="name" autoComplete="name" /></label>
      <label>Phone<input required name="phone" type="tel" autoComplete="tel" /></label>
      <label>Which home?
        <select name="home"><option>The Cantilever House</option><option>Seawall Penthouse</option><option>Laterite Villa</option><option>Not sure yet</option></select>
      </label>
      <button type="submit">Request a visit</button>
    </form>
  );
}
