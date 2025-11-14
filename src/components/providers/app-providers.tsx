'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from 'next-themes';
import { I18nextProvider } from 'react-i18next';
import { Toaster } from 'sonner';
import { useState } from 'react';

import { getQueryClient } from '@/lib/query-client';
import { i18n } from '@/lib/i18n';

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  const [client] = useState(() => getQueryClient());

  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <QueryClientProvider client={client}>
          {children}
          <ReactQueryDevtools initialIsOpen={false} />
          <Toaster richColors position="top-right" />
        </QueryClientProvider>
      </ThemeProvider>
    </I18nextProvider>
  );
};
