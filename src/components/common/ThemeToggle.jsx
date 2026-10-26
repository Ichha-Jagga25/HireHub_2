import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.jsx';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const Icon = theme === 'dark' ? Sun : Moon;
  return <button className="icon-button theme-toggle" type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} title="Change theme"><Icon size={18} /></button>;
}
