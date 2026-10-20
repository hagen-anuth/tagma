export const THEME_STORAGE_KEY = 'tagma-theme';

/** Runs before first paint so a stored dark theme does not flash light. */
export const THEME_INIT_SCRIPT = `try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}`;
