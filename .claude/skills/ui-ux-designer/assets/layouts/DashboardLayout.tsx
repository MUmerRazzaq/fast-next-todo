import React from 'react';

// Placeholder components - these would be replaced by actual components
// from the component library built with this skill.
const Sidebar = () => <aside className="w-64 bg-card p-4">Sidebar</aside>;
const Header = () => <header className="bg-card p-4">Header</header>;
const Footer = () => <footer className="bg-card p-4">Footer</footer>;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default DashboardLayout;
