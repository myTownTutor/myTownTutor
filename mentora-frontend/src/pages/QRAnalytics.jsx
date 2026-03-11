import React, { useEffect, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import api from '../services/api';
import SEO from '../components/SEO';

const PRIMARY = '#556B2F';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs shadow">
      <p className="font-semibold text-gray-700 mb-0.5">{label}</p>
      <p className="text-primary font-bold">{payload[0].value} scan{payload[0].value !== 1 ? 's' : ''}</p>
    </div>
  );
};

const shortDate = (d) => {
  const [, m, day] = d.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${day} ${months[parseInt(m,10)-1]}`;
};

const DAY_OPTIONS = [
  { label: '7 days', value: 7 },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
];

const QRAnalytics = () => {
  const [qrCodes, setQrCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [label, setLabel] = useState('');
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editLabel, setEditLabel] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // charts
  const [overviewData, setOverviewData] = useState([]);
  const [overviewDays, setOverviewDays] = useState(30);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [perQRData, setPerQRData] = useState({});
  const [perQRDays, setPerQRDays] = useState({});

  const fmt = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const fetchQR = async () => {
    try {
      const res = await api.get('/qr');
      setQrCodes(res.data.qr_codes || []);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Failed to load QR codes.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchQR(); }, []);

  const fetchOverview = async (days) => {
    setOverviewLoading(true);
    try {
      const res = await api.get(`/qr/0/stats?days=${days}`);
      setOverviewData(res.data.daily || []);
    } catch { setOverviewData([]); }
    finally { setOverviewLoading(false); }
  };
  useEffect(() => { fetchOverview(overviewDays); }, [overviewDays]);

  const fetchPerQR = async (qrId, days) => {
    try {
      const res = await api.get(`/qr/${qrId}/stats?days=${days}`);
      setPerQRData(p => ({ ...p, [qrId]: res.data.daily || [] }));
    } catch { setPerQRData(p => ({ ...p, [qrId]: [] })); }
  };

  const toggleExpand = (qrId) => {
    if (expandedId === qrId) { setExpandedId(null); return; }
    setExpandedId(qrId);
    fetchPerQR(qrId, perQRDays[qrId] || 30);
  };

  const changePerQRDays = (qrId, days) => {
    setPerQRDays(p => ({ ...p, [qrId]: days }));
    fetchPerQR(qrId, days);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!label.trim()) return;
    setCreating(true); setError('');
    try {
      const res = await api.post('/qr', { label: label.trim() });
      setQrCodes(prev => [res.data, ...prev]);
      setLabel(''); setShowForm(false);
    } catch (err) {
      setError(err?.response?.data?.error || err?.response?.data?.detail || err?.message || 'Failed to create QR code.');
    } finally { setCreating(false); }
  };

  const startEdit = (qr) => { setEditingId(qr.id); setEditLabel(qr.label); };
  const cancelEdit = () => { setEditingId(null); setEditLabel(''); };

  const handleRename = async (qr) => {
    if (!editLabel.trim() || editLabel.trim() === qr.label) { cancelEdit(); return; }
    setSaving(true);
    try {
      const res = await api.put(`/qr/${qr.id}`, { label: editLabel.trim() });
      setQrCodes(prev => prev.map(q => q.id === qr.id ? res.data : q));
      cancelEdit();
    } catch (err) { setError(err?.response?.data?.error || err?.message || 'Failed to rename.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (qr) => {
    if (!window.confirm(`Delete "${qr.label}"? This cannot be undone.`)) return;
    setDeletingId(qr.id);
    try {
      await api.delete(`/qr/${qr.id}`);
      setQrCodes(prev => prev.filter(q => q.id !== qr.id));
      if (expandedId === qr.id) setExpandedId(null);
    } catch (err) { setError(err?.response?.data?.error || err?.message || 'Failed to delete.'); }
    finally { setDeletingId(null); }
  };

  const downloadQR = (slug) => {
    const canvas = document.getElementById(`qr-canvas-${slug}`);
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `qr-${slug}.png`;
    a.click();
  };

  const overviewTotal = overviewData.reduce((s, d) => s + d.scans, 0);
  const overviewPeak = overviewData.reduce((p, d) => d.scans > (p?.scans || 0) ? d : p, null);

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-6">
      <SEO title="QR Analytics" noIndex />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">QR Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Generate QR codes and track scan activity in real time.</p>
        </div>
        <button onClick={() => setShowForm(v => !v)} className="btn-primary px-4 py-2 text-sm rounded-lg font-semibold">
          {showForm ? 'Cancel' : '+ Create New QR'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">New QR Code</h2>
          <form onSubmit={handleCreate} className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">Label</label>
              <input type="text" value={label} onChange={e => setLabel(e.target.value)}
                placeholder="e.g. Pamphlet – July 2025"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-primary transition bg-gray-50"
                required />
            </div>
            <button type="submit" disabled={creating}
              className="btn-primary px-5 py-2 text-sm rounded-lg font-semibold disabled:opacity-60">
              {creating ? 'Creating…' : 'Create'}
            </button>
          </form>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 ml-4 font-bold">✕</button>
        </div>
      )}

      {/* Overview chart */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h2 className="text-base font-semibold text-gray-800">All QR Codes – Combined Scans</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {overviewTotal} total scan{overviewTotal !== 1 ? 's' : ''}
              {overviewPeak && overviewPeak.scans > 0 && (
                <> · Peak: <span className="text-primary font-medium">{shortDate(overviewPeak.date)}</span> ({overviewPeak.scans})</>
              )}
            </p>
          </div>
          <div className="flex gap-1">
            {DAY_OPTIONS.map(o => (
              <button key={o.value} onClick={() => setOverviewDays(o.value)}
                className={`text-xs px-3 py-1 rounded-full border font-medium transition-colors ${overviewDays === o.value ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                {o.label}
              </button>
            ))}
          </div>
        </div>
        {overviewLoading ? (
          <div className="h-40 flex items-center justify-center text-sm text-gray-400">Loading…</div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={overviewData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradOverview" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={PRIMARY} stopOpacity={0.18} />
                  <stop offset="95%" stopColor={PRIMARY} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tickFormatter={shortDate}
                tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false}
                interval={overviewDays <= 7 ? 0 : Math.floor(overviewDays / 7)} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="scans" stroke={PRIMARY} strokeWidth={2}
                fill="url(#gradOverview)" dot={false} activeDot={{ r: 4, fill: PRIMARY }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Per-QR table */}
      {loading ? (
        <div className="text-sm text-gray-500 text-center py-12">Loading…</div>
      ) : qrCodes.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">No QR codes yet. Create your first one above.</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-3 w-8"></th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">QR</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Label</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Scans</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Scanned</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {qrCodes.map(qr => (
                  <React.Fragment key={qr.id}>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-3 text-center">
                        <button onClick={() => toggleExpand(qr.id)}
                          className="text-gray-400 hover:text-primary transition-colors text-lg leading-none">
                          {expandedId === qr.id ? '▾' : '▸'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <QRCodeCanvas id={`qr-canvas-${qr.slug}`} value={qr.qr_url}
                          size={64} bgColor="#ffffff" fgColor={PRIMARY} level="M" />
                      </td>
                      <td className="px-4 py-3 max-w-[200px]">
                        {editingId === qr.id ? (
                          <div className="flex flex-col gap-1.5">
                            <input autoFocus value={editLabel} onChange={e => setEditLabel(e.target.value)}
                              className="px-2 py-1 border border-primary rounded text-xs focus:outline-none focus:ring-2 focus:ring-green-100"
                              onKeyDown={e => { if (e.key === 'Enter') handleRename(qr); if (e.key === 'Escape') cancelEdit(); }} />
                            <div className="flex gap-1">
                              <button onClick={() => handleRename(qr)} disabled={saving}
                                className="text-xs px-2 py-0.5 bg-primary text-white rounded font-medium disabled:opacity-60">
                                {saving ? '…' : 'Save'}
                              </button>
                              <button onClick={cancelEdit} className="text-xs px-2 py-0.5 border border-gray-200 rounded text-gray-500">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <span className="font-medium text-gray-800 truncate block">{qr.label}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-50 text-primary font-bold text-base">
                          {qr.scan_count}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{fmt(qr.created_at)}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{fmt(qr.last_scanned_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1.5 items-center">
                          <button onClick={() => downloadQR(qr.slug)}
                            className="text-xs px-3 py-1 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors font-medium w-full">
                            ↓ PNG
                          </button>
                          <button onClick={() => startEdit(qr)}
                            className="text-xs px-3 py-1 border border-primary/30 rounded-lg text-primary hover:bg-green-50 transition-colors font-medium w-full">
                            ✏ Rename
                          </button>
                          <button onClick={() => handleDelete(qr)} disabled={deletingId === qr.id}
                            className="text-xs px-3 py-1 border border-red-200 rounded-lg text-red-500 hover:bg-red-50 transition-colors font-medium w-full disabled:opacity-60">
                            {deletingId === qr.id ? '…' : '🗑 Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded chart row */}
                    {expandedId === qr.id && (
                      <tr>
                        <td colSpan={7} className="bg-gray-50 border-t border-gray-100 px-6 py-5">
                          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                            <p className="text-sm font-semibold text-gray-700">
                              Daily scans — <span className="text-primary">{qr.label}</span>
                            </p>
                            <div className="flex gap-1">
                              {DAY_OPTIONS.map(o => (
                                <button key={o.value} onClick={() => changePerQRDays(qr.id, o.value)}
                                  className={`text-xs px-3 py-1 rounded-full border font-medium transition-colors ${(perQRDays[qr.id] || 30) === o.value ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                                  {o.label}
                                </button>
                              ))}
                            </div>
                          </div>
                          {!perQRData[qr.id] ? (
                            <div className="h-36 flex items-center justify-center text-xs text-gray-400">Loading…</div>
                          ) : (
                            <ResponsiveContainer width="100%" height={180}>
                              <BarChart data={perQRData[qr.id]} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="date" tickFormatter={shortDate}
                                  tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false}
                                  interval={Math.floor((perQRDays[qr.id] || 30) / 7)} />
                                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} allowDecimals={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="scans" fill={PRIMARY} radius={[3, 3, 0, 0]} maxBarSize={24} />
                              </BarChart>
                            </ResponsiveContainer>
                          )}
                          <div className="mt-3 flex items-center gap-2">
                            <span className="text-xs text-gray-400">QR URL:</span>
                            <a href={qr.qr_url} target="_blank" rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline break-all">{qr.qr_url}</a>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRAnalytics;

