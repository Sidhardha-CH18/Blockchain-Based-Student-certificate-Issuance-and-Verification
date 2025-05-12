import React from 'react';
import { useSpring, animated } from '@react-spring/web';
export const Background = () => {
  const [{
    background
  }] = useSpring(() => ({
    from: {
      background: '0%'
    },
    to: {
      background: '100%'
    },
    config: {
      duration: 3000
    }
  }));
  return <animated.div className="fixed inset-0 w-full h-full" style={{
    background: 'linear-gradient(135deg, #FBFBFB 0%, #F9B9D4 100%)',
    opacity: 0.8
  }}>
      <div className="absolute inset-0 bg-[url('https://assets.codepen.io/721952/noise.png')] opacity-50 mix-blend-overlay" />
    </animated.div>;
};