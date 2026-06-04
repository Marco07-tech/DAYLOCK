import { useLocation, useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/dashboard', icon: 'home', label: 'Home' },
  { path: '/gym', icon: 'fitness_center', label: 'Gym' },
  { path: '/stats', icon: 'bar_chart', label: 'Stats' },
  { path: '/settings', icon: 'settings', label: 'Settings' },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 flex justify-around items-center px-4 py-3 bg-surface-container-low shadow-[0_-4px_20px_rgba(26,26,26,0.03)] rounded-t-xl">
      {NAV_ITEMS.map(({ path, icon, label }) => {
        const isActive = location.pathname === path;
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
              className={`flex flex-col items-center justify-center transition-all w-16 ${
              isActive
                ? 'bg-primary-container text-on-primary-container rounded-full px-4 py-1'
                : 'text-on-surface-variant opacity-60 hover:text-primary'
            }`}
            title={label}
          >
            <span
              className="material-symbols-outlined"
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {icon}
            </span>
            <span className="font-label-sm text-label-sm">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
