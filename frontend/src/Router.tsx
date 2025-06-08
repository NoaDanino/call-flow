import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AdminPage } from './pages/Admin/AdminPage';
import { HomePage } from './pages/Home.page';
import { LoginPage } from './pages/Login/LoginPage';
import { RegisterPage } from './pages/Register/RegisterPage';
import { UserPage } from './pages/User/UserPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/admin',
    element: <AdminPage />,
  },
  {
    path: '/user',
    element: <UserPage />,
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
