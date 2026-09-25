const API_BASE = 'http://127.0.0.1:8000/api/market';

export async function fetchSnapshot() {
  const res = await fetch(`${API_BASE}/snapshot`);
  return res.json();
}