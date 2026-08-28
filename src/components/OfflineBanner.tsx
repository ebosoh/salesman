import React from 'react';
import { useOffline } from '../context/OfflineContext';
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const { isOnline, pendingCount, isSyncing, triggerManualSync } = useOffline();

  return (
    <aside aria-label="Network and synchronization status" className="w-full text-xs font-medium sticky top-0 z-50 transition-all duration-300">
      {!isOnline ? (
        <div className="bg-amber-500 text-slate-950 px-3 py-2 flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-2">
            <WifiOff className="w-4 h-4 animate-pulse flex-shrink-0" />
            <span>
              <strong>Offline Mode</strong> — {pendingCount} {pendingCount === 1 ? 'entry' : 'entries'} stored safely on device
            </span>
          </div>
          <span className="bg-amber-600/30 text-amber-950 px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider">
            Auto-Sync Ready
          </span>
        </div>
      ) : pendingCount > 0 ? (
        <div className="bg-blue-600 text-white px-3 py-1.5 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2">
            <Wifi className="w-4 h-4 flex-shrink-0" />
            <span>
              <strong>Online</strong> — {pendingCount} pending {pendingCount === 1 ? 'item' : 'items'} in queue
            </span>
          </div>
          <button
            onClick={triggerManualSync}
            disabled={isSyncing}
            className="flex items-center space-x-1 bg-white text-blue-700 hover:bg-blue-50 px-2.5 py-1 rounded text-xs font-semibold shadow-sm transition active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
          </button>
        </div>
      ) : (
        <div className="bg-slate-900/90 backdrop-blur text-slate-200 px-3 py-1 flex items-center justify-between text-[11px]">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-emerald-400 font-semibold">Online</span>
            <span className="text-slate-400">| Local Queue Synced</span>
          </div>
          <div className="flex items-center space-x-1 text-slate-400">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>All records up to date</span>
          </div>
        </div>
      )}
    </aside>
  );
};
