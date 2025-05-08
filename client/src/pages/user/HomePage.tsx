import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-neutral-800 shadow-sm p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="material-icons text-primary text-2xl">account_balance</span>
            <h1 className="text-xl font-semibold text-primary">Tujifund</h1>
          </div>
          <div className="space-x-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Register</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 bg-gradient-to-br from-primary-light/10 to-secondary/10 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-dark">
              Financial Empowerment Through Community
            </h1>
            <p className="text-lg mb-8 text-neutral-700 dark:text-neutral-300">
              Join Tujifund to save, invest, and grow together with your community. 
              Manage your chamas, connect with members, and achieve your financial goals.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="px-8">
                  Get Started
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="px-8">
                  Login to Your Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white dark:bg-neutral-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What You Can Do With Tujifund</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-neutral-50 dark:bg-neutral-700 p-6 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="material-icons text-primary">groups</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Form and Manage Chamas</h3>
              <p className="text-neutral-600 dark:text-neutral-300">
                Create and manage investment groups with transparent financial tracking and role-based access.
              </p>
            </div>
            <div className="bg-neutral-50 dark:bg-neutral-700 p-6 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                <span className="material-icons text-secondary">account_balance_wallet</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Manage Finances</h3>
              <p className="text-neutral-600 dark:text-neutral-300">
                Track contributions, expenses, and investments with secure wallets and transparent transaction history.
              </p>
            </div>
            <div className="bg-neutral-50 dark:bg-neutral-700 p-6 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                <span className="material-icons text-accent-dark">smart_toy</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Financial Assistant</h3>
              <p className="text-neutral-600 dark:text-neutral-300">
                Get personalized financial advice, insights, and learning resources powered by AI.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-200 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <span className="material-icons text-primary text-2xl">account_balance</span>
              <h2 className="text-xl font-semibold text-primary">Tujifund</h2>
            </div>
            <div className="text-sm text-neutral-400">
              &copy; {new Date().getFullYear()} Tujifund. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
