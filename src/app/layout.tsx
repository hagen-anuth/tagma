import {Geist_Mono} from 'next/font/google';

import {THEME_INIT_SCRIPT} from '@/lib/theme';

import type {Metadata} from 'next';

import './globals.css';

const geistMono = Geist_Mono({
    subsets: ['latin'],
    variable: '--font-geist-mono',
});

export const metadata: Metadata = {
    title: 'tagma',
    description: 'Income and expenses, kept in order',
    icons: {icon: '/logo.svg'},
};

export default function RootLayout({children}: LayoutProps<'/'>) {
    return (
        <html lang="en" className={geistMono.variable} suppressHydrationWarning>
            <head>
                <script dangerouslySetInnerHTML={{__html: THEME_INIT_SCRIPT}} />
            </head>
            <body>{children}</body>
        </html>
    );
}
