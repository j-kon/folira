import { createBrowserRouter } from 'react-router-dom';
import { LibraryPage } from '@/pages/LibraryPage';
import { ReaderPage } from '@/pages/ReaderPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { DiagnosticPage } from '@/pages/DiagnosticPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LibraryPage />,
  },
  {
    path: '/reader/:id',
    element: <ReaderPage />,
  },
  {
    path: '/settings',
    element: <SettingsPage />,
  },
  {
    path: '/diagnostic',
    element: <DiagnosticPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
