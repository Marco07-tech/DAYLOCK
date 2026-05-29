import { BottomNav } from './BottomNav';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div
      style={{
        maxWidth: '430px',
        margin: '0 auto',
        minHeight: '100vh',
        background: '#0A0A0F',
        position: 'relative',
        overflow: 'hidden',
      }}
      className="flex flex-col"
    >
      <div className="flex-1 pb-20">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
