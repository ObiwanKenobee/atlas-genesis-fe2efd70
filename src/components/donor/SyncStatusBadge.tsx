import { AlertCircle, CheckCircle2, Loader2, RadioTower, RefreshCcw, WifiOff } from 'lucide-react';
import type { SyncStatus } from '@/hooks/useVerificationSync';
import { Button } from '@/components/ui/button';

interface Props {
  status: SyncStatus;
  lastSyncedAt: Date | null;
  error?: string | null;
  onRetry?: () => void;
  compact?: boolean;
}

const CONFIG: Record<SyncStatus, { label: string; icon: typeof RadioTower; className: string }> = {
  idle:       { label: 'Idle',        icon: RadioTower, className: 'text-muted-foreground' },
  connecting: { label: 'Connecting',  icon: Loader2,    className: 'text-muted-foreground animate-pulse' },
  live:       { label: 'Live',        icon: RadioTower, className: 'text-emerald-600' },
  polling:    { label: 'Synced',      icon: CheckCircle2, className: 'text-emerald-600' },
  retrying:   { label: 'Retrying',    icon: RefreshCcw, className: 'text-amber-600' },
  error:      { label: 'Offline',     icon: WifiOff,    className: 'text-red-600' },
};

export const SyncStatusBadge = ({ status, lastSyncedAt, error, onRetry, compact }: Props) => {
  const cfg = CONFIG[status];
  const Icon = cfg.icon;
  const spin = status === 'connecting' || status === 'retrying';
  return (
    <div className={`inline-flex items-center gap-2 text-xs ${compact ? '' : 'px-2.5 py-1 rounded-md border border-border/50 bg-muted/30'}`}>
      <Icon className={`w-3.5 h-3.5 ${cfg.className} ${spin ? 'animate-spin' : ''}`} />
      <span className={cfg.className}>{cfg.label}</span>
      {lastSyncedAt && status !== 'error' && (
        <span className="text-muted-foreground">· {lastSyncedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      )}
      {status === 'error' && (
        <>
          {error && <span className="text-red-600 hidden sm:inline">· {error}</span>}
          {onRetry && (
            <Button variant="ghost" size="sm" className="h-6 px-2 gap-1" onClick={onRetry}>
              <AlertCircle className="w-3 h-3" /> Retry
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default SyncStatusBadge;