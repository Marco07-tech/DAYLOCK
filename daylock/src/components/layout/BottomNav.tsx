import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Dumbbell, BarChart2, Cog } from 'lucide-react';
import { cn } from '../../lib/utils';

const NAV_ITEMS = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { path: '/gym', icon: Dumbbell, label: 'Gym' },
  { path: '/stats', icon: BarChart2, label: 'Stats' },
  { path: '/settings', icon: Cog, label: 'Settings' },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-secondary border-t border-bg-border h-16 max-w-[430px] mx-auto w-full">
      <nav className="flex justify-around items-center h-full">
        {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors"
              title={label}
            >
              <Icon
                size={22}
                className={cn(
                  'transition-colors',
                  isActive ? 'text-accent-lime' : 'text-text-secondary'
                )}
              />
            </button>
          );
        })}
      </nav>
    </div>
  );
}
