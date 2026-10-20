'use client';

import {MoonIcon, SunIcon} from 'lucide-react';

import {THEME_STORAGE_KEY} from '@/lib/theme';

import {Button} from '@/components/ui/button';

export function ThemeToggle(): React.ReactElement {
    function toggle(): void {
        const isDark = document.documentElement.classList.toggle('dark');
        try {
            localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
        } catch {
            // storage blocked; the toggle still applies for this page view
        }
    }

    return (
        <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggle}
            aria-label="Toggle dark mode"
        >
            <SunIcon className="hidden dark:block" />
            <MoonIcon className="dark:hidden" />
        </Button>
    );
}
