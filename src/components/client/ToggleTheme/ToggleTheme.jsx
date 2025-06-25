'use client';
import { useEffect, useState } from 'react';
import { useTranslations } from 'use-intl';

const SetTheme = () => {
  const [theme, setTheme] = useState(global.window?.__theme || 'light');

  const isDark = theme === 'dark';

  const toggleTheme = () => {
    global.window?.__setPreferredTheme(theme === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    global.window.__onThemeChange = setTheme;
  }, []);

  const t = useTranslations('Components.ToggleTheme');

  return (
    <button onClick={toggleTheme}>{isDark ? t('Dark') : t('Light')}</button>
  );
};

export default SetTheme;
