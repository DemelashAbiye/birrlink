import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { t, formatETB } from '../utils';
import { Bell, CheckCheck } from 'lucide-react';

const TYPE_ICON = { info: 'ℹ️', success: '✅', warning: '⚠️', invoice: '🧾', finance: '💰' };

export default function Notifications() {
  const { lang } = useAuth();
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => api.get('/notifications').then(r => setNotifs(r.data)).finally(() => setLoading(false));
  useEffect(load, []);

  const markRead = async id => {
    await api.patch(`/notifications/${id}/read`);
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: 1 } : n));
  };
  const markAll = async () => {
    await api.patch('/notifications/read-all');
    setNotifs(prev => prev.map(n => ({ ...n, read: 1 })));
  };

  const unread = notifs.filter(n => !n.read).length;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bell size={24} /> {t(lang,'Notifications','ማሳወቂያዎች')}
          {unread > 0 && <span className="badge bg-red-100 text-red-700">{unread} {t(lang,'new','አዲስ')}</span>}
        </h1>
        {unread > 0 && (
          <button onClick={markAll} className="btn-secondary flex items-center gap-1.5 text-sm">
            <CheckCheck size={16} /> {t(lang,'Mark all read','ሁሉ ተነቦ ምልክት ያድርጉ')}
          </button>
        )}
      </div>

      {loading ? <div className="text-center py-12 text-gray-400">Loading...</div> :
       notifs.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          <Bell size={40} className="mx-auto mb-2 opacity-30" />
          <p>{t(lang,'No notifications yet.','ምንም ማሳወቂያ የለም።')}</p>
        </div>
       ) : (
        <div className="space-y-2">
          {notifs.map(n => (
            <div key={n.id}
              onClick={() => !n.read && markRead(n.id)}
              className={`card cursor-pointer transition-all hover:shadow-md ${!n.read ? 'border-l-4 border-l-green-600 bg-green-50' : ''}`}>
              <div className="flex items-start gap-3">
                <span className="text-2xl mt-0.5">{TYPE_ICON[n.type] || 'ℹ️'}</span>
                <div className="flex-1">
                  <p className="text-sm text-gray-800">
                    {lang === 'am' && n.message_am ? n.message_am : n.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(n.created_at).toLocaleString('en-ET')}
                  </p>
                </div>
                {!n.read && <span className="w-2 h-2 rounded-full bg-green-600 mt-1.5 shrink-0" />}
              </div>
            </div>
          ))}
        </div>
       )}
    </div>
  );
}
