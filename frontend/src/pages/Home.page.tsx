import { LoginPage } from './Login/LoginPage.js';
import { RegisterPage } from './Register/RegisterPage.js';

export function HomePage() {
  return (
    <>
      {/* <Welcome />
      <ColorSchemeToggle /> */}
      <LoginPage />
      <RegisterPage />
    </>
  );
}
