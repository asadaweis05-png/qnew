import React from 'react';

const Footer = () => {
  return (
    <footer className="py-8 px-4 border-t border-border bg-card/50">
      <div className="container-wide">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-display text-xl text-foreground">NutriTrack</p>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} NutriTrack. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
