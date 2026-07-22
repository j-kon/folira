import { createBrowserRouter } from 'react-router-dom';
import { LibraryPage } from '@/pages/LibraryPage';
import { ReaderPage } from '@/pages/ReaderPage';
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
    path: '*',
    element: <NotFoundPage />,
  },
]);
