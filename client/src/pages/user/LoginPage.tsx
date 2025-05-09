import React from 'react';
import LoginForm from '@/components/auth/LoginForm';

interface LoginPageProps {
  redirectTo?: string;
}

const LoginPage: React.FC<LoginPageProps> = ({ redirectTo }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white dark:bg-neutral-800 shadow-sm p-4">
        <div className="container mx-auto flex justify-center items-center">
          <div className="flex items-center space-x-2">
            {/* <span className="material-icons text-primary text-2xl">account_balance</span> */}
            <h1 className="text-xl font-semibold text-primary">Tujifund</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 bg-gradient-to-br from-primary-light/10 to-secondary/10">
        <LoginForm redirectTo={redirectTo} />
      </main>

      <footer className="bg-neutral-900 text-neutral-200 py-4">
        <div className="container mx-auto px-4 text-center">
          <div className="text-sm text-neutral-400">
            &copy; {new Date().getFullYear()} Tujifund. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;
