import React, { useEffect, useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import api from '../services/api';

const QRAnalytics = () => {
  const [qrCodes, setQrCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [label, setLabel] = useState('');
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  // rename state
  const [editingId, setEditingId] = useState(null);
  const [editLabel, setEditLabel] = useState('');
  const [saving, setSaving] = useState(false);

  // delete state
  const [deletingId, setDeletingId] = useState(null);

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

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!label.trim()) return;
    setCreating(true);
    setError('');
    try {
      const res = await api.post('/qr', { label: label.trim() });
      setQrCodes((prev) => [...prev, res.data]);
      setLabel('');
      setShowForm(false);
    } catch (err) {
      setError(err?.response?.data?.error || err?.response?.data?.detail || err?.message || 'Failed to create QR code.');
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (qr) => {
    setEditingId(qr.id);
    setEditLabel(qr.label);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditLabel('');
  };

  const handleRename = async (qr) => {
    if (!editLabel.trim() || editLabel.trim() === qr.label) { cancelEdit(); return; }
    setSaving(true);
    try {
      const res = await api.put(`/qr/${qr.id}`, { label: editLabel.trim() });
      setQrCodes((prev) => prev.map((q) => q.id === qr.id ? res.data : q));
      cancelEdit();
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Failed to rename.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (qr) => {
    if (!window.confirm(`Delete "${qr.label}"? This cannot be undone.`)) return;
    setDeletingId(qr.id);
    try {
      await api.delete(`/qr/${qr.id}`);
      setQrCodes((prev) => prev.filter((q) => q.id !== qr.id));
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Failed to delete.');
    } finally {
      setDeletingId(null);
    }
  };

  const downloadQR = (slug, num) => {
    const canvas = document.getElementById(`qr-canvas-${slug}`);
    if (!canvas) return;
    // Create offscreen canvas to composite QR + number badge
    const offscreen = document.createElement('canvas');
    offscreen.width = canvas.width;
    offscreen.height = canvas.height;
    const ctx = offscreen.getContext('2d');
    ctx.drawImage(canvas, 0, 0);
    // Draw number badge at bottom-right
    const badgeSize = Math.round(canvas.width * 0.12);
    const x = canvas.width - badgeSize;
    const y = canvas.height - badgeSize;
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(x, y, badgeSize, badgeSize);
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.round(badgeSize * 0.65)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(num), x + badgeSize / 2, y + badgeSize / 2);
    const url = offscreen.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `qr-${slug}.png`;
    a.click();
  };

  const fmt = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="max-w-6xl mx-auto py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">QR Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">
            Generate QR codes for offline campaigns and track scan counts in real time.
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="btn-primary px-4 py-2 text-sm rounded-lg font-semibold"
        >
          {showForm ? 'Cancel' : '+ Create New QR'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">New QR Code</h2>
          <form onSubmit={handleCreate} className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">Label</label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Pamphlet – July 2025"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-primary transition bg-gray-50"
                required
              />
            </div>
            <button
              type="submit"
              disabled={creating}
              className="btn-primary px-5 py-2 text-sm rounded-lg font-semibold disabled:opacity-60"
            >
              {creating ? 'Creating…' : 'Create'}
            </button>
          </form>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 ml-4 font-bold">✕</button>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-sm text-gray-500 text-center py-12">Loading…</div>
      ) : qrCodes.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          No QR codes yet. Create your first one above.
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">QR</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Label</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">URL</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Scans</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Scanned</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {qrCodes.map((qr, idx) => (
                  <tr key={qr.id} className="hover:bg-gray-50 transition-colors">
                    {/* Index */}
                    <td className="px-3 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs font-bold">{idx + 1}</span>
                    </td>
                    {/* QR Image */}
                    <td className="px-4 py-3">
                      <div className="relative inline-block">
                        <QRCodeCanvas
                          id={`qr-canvas-${qr.slug}`}
                          value={qr.qr_url}
                          size={300}
                          style={{ width: '72px', height: '72px' }}
                          bgColor="#ffffff"
                          fgColor="#000000"
                          level="H"
                        />
                        <span className="absolute bottom-0 right-0 bg-gray-800 text-white text-[9px] font-bold leading-none px-1 py-0.5 rounded-tl">
                          {idx + 1}
                        </span>
                      </div>
                    </td>
                    {/* Label — inline edit */}
                    <td className="px-4 py-3 max-w-[200px]">
                      {editingId === qr.id ? (
                        <div className="flex flex-col gap-1.5">
                          <input
                            autoFocus
                            value={editLabel}
                            onChange={(e) => setEditLabel(e.target.value)}
                            className="px-2 py-1 border border-primary rounded text-xs focus:outline-none focus:ring-2 focus:ring-green-100"
                            onKeyDown={(e) => { if (e.key === 'Enter') handleRename(qr); if (e.key === 'Escape') cancelEdit(); }}
                          />
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleRename(qr)}
                              disabled={saving}
                              className="text-xs px-2 py-0.5 bg-primary text-white rounded font-medium disabled:opacity-60"
                            >
                              {saving ? '…' : 'Save'}
                            </button>
                            <button onClick={cancelEdit} className="text-xs px-2 py-0.5 border border-gray-200 rounded text-gray-500">
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className="font-medium text-gray-800 truncate block">{qr.label}</span>
                      )}
                    </td>
                    {/* URL */}
                    <td className="px-4 py-3">
                      <a
                        href={qr.qr_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-xs break-all"
                      >
                        {qr.qr_url}
                      </a>
                    </td>
                    {/* Scans */}
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-50 text-primary font-bold text-base">
                        {qr.scan_count}
                      </span>
                    </td>
                    {/* Created */}
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {fmt(qr.created_at)}
                    </td>
                    {/* Last Scanned */}
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {fmt(qr.last_scanned_at)}
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1.5 items-center">
                        <button
                          onClick={() => downloadQR(qr.slug, idx + 1)}
                          className="text-xs px-3 py-1 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors font-medium w-full"
                        >
                          ↓ PNG
                        </button>
                        <button
                          onClick={() => startEdit(qr)}
                          className="text-xs px-3 py-1 border border-primary/30 rounded-lg text-primary hover:bg-green-50 transition-colors font-medium w-full"
                        >
                          ✏ Rename
                        </button>
                        <button
                          onClick={() => handleDelete(qr)}
                          disabled={deletingId === qr.id}
                          className="text-xs px-3 py-1 border border-red-200 rounded-lg text-red-500 hover:bg-red-50 transition-colors font-medium w-full disabled:opacity-60"
                        >
                          {deletingId === qr.id ? '…' : '🗑 Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
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
