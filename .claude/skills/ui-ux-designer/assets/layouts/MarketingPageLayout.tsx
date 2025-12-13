import React from 'react';

// Placeholder components
const Nav = () => <nav className="bg-card p-4">Navigation</nav>;
const Hero = () => <section className="bg-primary text-primary-foreground p-20 text-center">Hero Section</section>;
const Features = () => <section className="p-16">Features Section</section>;
const CTA = () => <section className="bg-secondary p-20 text-center">Call to Action</section>;
const Footer = () => <footer className="bg-card p-8">Footer</footer>;

interface MarketingPageLayoutProps {
  children: React.ReactNode;
}

export const MarketingPageLayout: React.FC<MarketingPageLayoutProps> = ({ children }) => {
  return (
    <div className="bg-background">
      <Nav />
      <Hero />
      <main>
        <Features />
        {children}
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default MarketingPageLayout;
