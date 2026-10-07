'use client';
import { useEffect, useState } from 'react';
import { ui, FACADES, CHAPTERS } from './store';

export default function Configurator() {
  const [fac, setFac] = useState(0);
  const [time, setTime] = useState(null);
  const [ch, setCh] = useState(0);
  useEffect(() => {
    let id;
    const loop = () => {
      const c = Math.min(CHAPTERS.length - 1, Math.floor(ui.value * CHAPTERS.length));
      setCh((p) => (p === c ? p : c));
      id = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(id);
  }, []);
  const pick = (i) => { setFac(i); ui.base = FACADES[i].c; };
  const slide = (v) => { setTime(v); ui.time = v; };
  return (
    <>
      <ol className="hud" aria-label="Tour chapters">
        {CHAPTERS.map((c, i) => <li key={c} className={i === ch ? 'on' : ''}>{c}</li>)}
      </ol>
      <aside className="cfg" aria-label="Customise the house">
        <p className="cfg-t">Choose the glass</p>
        <div className="sw">
          {FACADES.map((f, i) => (
            <button key={f.n} title={f.n} aria-label={f.n} aria-pressed={fac === i} className={fac === i ? 'on' : ''} style={{ background: f.c }} onClick={() => pick(i)} />
          ))}
        </div>
        <label className="tm">Time of day
          <input type="range" min="0" max="1" step="0.01" value={time ?? ui.value} onChange={(e) => slide(parseFloat(e.target.value))} />
        </label>
        {time !== null && <button className="auto" onClick={() => { setTime(null); ui.time = null; }}>Follow scroll</button>}
      </aside>
    </>
  );
}
