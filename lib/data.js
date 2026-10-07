import { useEffect, useState } from 'react';

export const KEY = 'aurelian_db_v1', USER_KEY = 'aurelian_user';
export const COMM = 2.5; // total commission % (1% buyer + 1.5% seller)
export const AGENTS = ['Ananya Sharma', 'Rohan Mehta', 'Simran Kaur', 'Vikram Singh'];
export const cr = (n) => `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 })} Cr`;
export const today = () => new Date().toISOString().slice(0, 10);

// DEMO ONLY: replace with a real backend / NextAuth before going live.
export const DEMO = { email: 'admin@aurelian.com', password: 'Aurelian@123', name: 'Admin' };
export const getUser = () => { try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; } };
export const loginUser = (u) => localStorage.setItem(USER_KEY, JSON.stringify(u));
export const logout = () => localStorage.removeItem(USER_KEY);

const L = (id, title, city, type, price, beds, area, status, agent, listed) => ({ id, title, city, type, price, beds, area, status, agent, listed });
const S = (id, title, city, listPrice, soldPrice, buyer, agent, date) => ({ id, title, city, listPrice, soldPrice, buyer, agent, date });
export const SEED = {
  listings: [
    L(1, 'The Cantilever House', 'Chandigarh', 'Residence', 14.5, 5, 8200, 'Available', AGENTS[0], '2026-09-02'),
    L(2, 'Seawall Penthouse', 'Mumbai', 'Penthouse', 42, 4, 5600, 'Under offer', AGENTS[1], '2026-08-21'),
    L(3, 'Laterite Villa', 'Goa', 'Residence', 9.8, 4, 4900, 'Available', AGENTS[2], '2026-09-15'),
    L(4, 'Orchard Plot, 2 acres', 'Kasauli', 'Land', 6.2, 0, 87120, 'Available', AGENTS[3], '2026-07-30'),
    L(5, 'Skyline Duplex', 'Gurugram', 'Penthouse', 21, 4, 6100, 'Reserved', AGENTS[0], '2026-09-20'),
    L(6, 'Sector 9 Courtyard Home', 'Chandigarh', 'Residence', 11.2, 4, 5300, 'Available', AGENTS[1], '2026-10-01'),
  ],
  sold: [
    S(101, 'Ridge Road Bungalow', 'Shimla', 8.4, 8.1, 'Mr. Arjun Kapoor', AGENTS[2], '2026-09-18'),
    S(102, 'Marine Drive Apartment', 'Mumbai', 31, 30.2, 'Mrs. Neha Bhatia', AGENTS[1], '2026-09-05'),
    S(103, 'Palm Grove Villa', 'Goa', 12.5, 12.5, 'Mr. Imran Qureshi', AGENTS[0], '2026-08-12'),
    S(104, 'Aerocity Penthouse', 'Mohali', 9.2, 8.9, 'Dr. Harpreet Gill', AGENTS[3], '2026-07-27'),
    S(105, 'Lakeview Farmhouse', 'Kasauli', 5.5, 5.2, 'Mr. Sandeep Rao', AGENTS[2], '2026-07-09'),
    S(106, 'Golf Course Residence', 'Gurugram', 18.6, 18.0, 'Ms. Meera Nair', AGENTS[0], '2026-06-20'),
  ],
  leads: [
    { id: 201, name: 'Karan Malhotra', phone: '98765 43210', interest: 'The Cantilever House', status: 'Visit booked', date: '2026-10-05' },
    { id: 202, name: 'Pooja Verma', phone: '99880 11223', interest: 'Laterite Villa', status: 'New', date: '2026-10-06' },
    { id: 203, name: 'Gurdeep Sandhu', phone: '98140 55667', interest: 'Orchard Plot, 2 acres', status: 'Contacted', date: '2026-10-03' },
    { id: 204, name: 'Aditi Joshi', phone: '97110 22334', interest: 'Seawall Penthouse', status: 'Contacted', date: '2026-10-01' },
  ],
};

const read = () => { try { const s = localStorage.getItem(KEY); return s ? JSON.parse(s) : SEED; } catch { return SEED; } };
const write = (d) => { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch {} };
export const addLead = (lead) => { const d = read(); write({ ...d, leads: [{ id: Date.now(), status: 'New', date: today(), ...lead }, ...d.leads] }); };

export function useDb() {
  const [db, setDb] = useState(SEED);
  const [ready, setReady] = useState(false);
  useEffect(() => { setDb(read()); setReady(true); }, []);
  const save = (next) => { setDb(next); write(next); };
  const reset = () => save(SEED);
  return { db, ready, save, reset };
}
