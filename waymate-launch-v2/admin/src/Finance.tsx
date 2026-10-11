import React, { useCallback, useEffect, useState } from 'react';
import { adminApi } from './api/admin';

type Remittance = {
  id: string;
  amount: number;
  externalReference: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  createdAt: string;
  driver: { firstName?: string; lastName?: string; phone?: string };
};

export default function Finance() {
  const [rows, setRows] = useState<Remittance[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      setRows(await adminApi.commissionRemittances());
    } catch (cause: any) {
      setError(cause.message || 'Could not load commission remittances.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const review = async (id: string, status: 'VERIFIED' | 'REJECTED') => {
    setBusy(id);
    setError('');
    try {
      await adminApi.reviewCommissionRemittance(id, status);
      await load();
    } catch (cause: any) {
      setError(cause.message || 'Could not update the remittance.');
    } finally {
      setBusy('');
    }
  };

  const pending = rows.filter(row => row.status === 'PENDING');

  return <>
    <div className="top">
      <div><h1>Platform commission</h1><p className="muted">Review external driver remittances against cash-ride commission dues.</p></div>
      <span className="pill">{pending.length} pending</span>
    </div>
    {error && <div className="card" role="alert" style={{ color: '#b42318', marginBottom: 16 }}>{error}</div>}
    <div className="card">
      {loading ? <p className="muted">Loading remittances…</p> : <table className="table">
        <thead><tr><th>Driver</th><th>Amount</th><th>External reference</th><th>Submitted</th><th>Status</th><th>Review</th></tr></thead>
        <tbody>{rows.map(row => <tr key={row.id}>
          <td>{row.driver?.firstName || 'Driver'} {row.driver?.lastName || ''}<br />{row.driver?.phone || ''}</td>
          <td>₹{Number(row.amount).toLocaleString('en-IN')}</td>
          <td>{row.externalReference}</td>
          <td>{new Date(row.createdAt).toLocaleString('en-IN')}</td>
          <td>{row.status}</td>
          <td>{row.status === 'PENDING' ? <>
            <button className="btn" disabled={busy === row.id} onClick={() => review(row.id, 'VERIFIED')}>{busy === row.id ? 'Saving…' : 'Verify'}</button>{' '}
            <button className="btn danger" disabled={busy === row.id} onClick={() => review(row.id, 'REJECTED')}>Reject</button>
          </> : '—'}</td>
        </tr>)}</tbody>
      </table>}
    </div>
  </>;
}
