import { useEffect, useState } from 'react';
import { Navigation } from './sections/Navigation';
import { Hero } from './sections/Hero';
import { InfinityLibrary } from './sections/InfinityLibrary';
import { AcademicResearch } from './sections/AcademicResearch';
import { BusinessSolutions } from './sections/BusinessSolutions';
import { DepartmentTemplates } from './sections/DepartmentTemplates';
import { Features } from './sections/Features';
import { HowItWorks } from './sections/HowItWorks';
import { Pricing } from './sections/Pricing';
import { Newsletter } from './sections/Newsletter';
import { CTA } from './sections/CTA';
import { Footer } from './sections/Footer';
import './App.css';

function App() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Navigation scrolled={scrolled} />
      <main>
        <Hero />
        <InfinityLibrary />
        <AcademicResearch />
        <BusinessSolutions />
        <DepartmentTemplates />
        <Features />
        <HowItWorks />
        <Pricing />
        <Newsletter />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

export default App;
