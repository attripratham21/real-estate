'use client';
const CITIES = ['All', 'Chandigarh', 'Mumbai', 'Goa', 'Kasauli', 'Gurugram'];
const TYPES = ['All', 'Residence', 'Penthouse', 'Land'];

export default function HeroSearch() {
  const submit = (e) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    window.dispatchEvent(new CustomEvent('aurelian-search', { detail: { city: f.city, tab: f.type, max: +f.max } }));
    document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <form className="panel form hsearch" onSubmit={submit}>
      <h2>Find your home</h2>
      <label>Location<select name="city">{CITIES.map((c) => <option key={c} value={c}>{c === 'All' ? 'Any city' : c}</option>)}</select></label>
      <label>Property type<select name="type">{TYPES.map((c) => <option key={c} value={c}>{c === 'All' ? 'Any type' : c}</option>)}</select></label>
      <label>Max budget<select name="max"><option value="0">Any budget</option><option value="10">Up to ₹10 Cr</option><option value="20">Up to ₹20 Cr</option><option value="50">Up to ₹50 Cr</option></select></label>
      <button type="submit">Search homes</button>
      <p className="hint">Prefer to talk? Call +91 98765 00001</p>
    </form>
  );
}
