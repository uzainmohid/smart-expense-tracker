import React, { createContext, useContext, useState, useEffect } from 'react';

const ColorModeContext = createContext();

export const useColorMode = () => {
  const context = useContext(ColorModeContext);
  if (!context) {
    throw new Error('useColorMode must be used within ColorModeProvider');
  }
  return context;
};

export const ColorModeProvider = ({ children }) => {
  const [colorMode, setColorMode] = useState(() => {
    const saved = localStorage.getItem('chakra-ui-color-mode');
    return saved || 'light';
  });

  const toggleColorMode = () => {
    const newMode = colorMode === 'light' ? 'dark' : 'light';
    setColorMode(newMode);
    localStorage.setItem('chakra-ui-color-mode', newMode);
    document.documentElement.setAttribute('data-theme', newMode);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', colorMode);
    localStorage.setItem('chakra-ui-color-mode', colorMode);
  }, [colorMode]);

  return (
    <ColorModeContext.Provider value={{ colorMode, toggleColorMode }}>
      {children}
    </ColorModeContext.Provider>
  );
};
