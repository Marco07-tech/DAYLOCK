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
        background: '#fcf9f8',
        position: 'relative',
        overflow: 'hidden',
      }}
      className="flex flex-col"
    >
      <div className="flex-1 pb-24">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
