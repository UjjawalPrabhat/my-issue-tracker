import React from 'react';
import Navbar from '../../../components/layout/Navbar';
import Hero from '../../../components/common/Hero';
import Footer from '../../../components/layout/Footer';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex flex-col">
      {/* Hash pattern background */}
      <div 
        className="fixed inset-0 opacity-[0.1]"
        style={{
          backgroundImage: 'url(https://ibpublicimages.s3.us-west-2.amazonaws.com/scaler-landing/hash.svg)',
          backgroundRepeat: 'repeat',
          backgroundSize: '400px',
          transform: 'rotate(-10deg)',
          backgroundPosition: 'center',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />
      
      <Navbar />
      <Hero />

      {/* Impact SVG at bottom */}
      <div 
        className="fixed bottom-0 left-0 right-0 h-[400px]"
        style={{
          backgroundImage: 'url(https://ibpublicimages.s3.us-west-2.amazonaws.com/scaler-landing/impact.svg)',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'bottom center',
          backgroundSize: 'contain',
          opacity: 0.15,
          pointerEvents: 'none',
          zIndex: 2
        }}
      />
      <Footer />
    </div>
  );
};

export default LandingPage;