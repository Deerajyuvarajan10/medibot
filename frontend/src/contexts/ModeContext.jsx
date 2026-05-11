import React, { createContext, useContext, useState } from 'react';

const ModeContext = createContext();

export const MODES = {
  GENERAL: 'general',
  MEDBOOKS: 'medbooks',
  DOCTOR: 'doctor',
  IMAGEGEN: 'imagegen'
};

export function useMode() {
  return useContext(ModeContext);
}

export function ModeProvider({ children }) {
  const [currentMode, setCurrentMode] = useState(MODES.GENERAL);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  const setMode = (mode) => {
    if (Object.values(MODES).includes(mode)) {
      setCurrentMode(mode);
    }
  };

  const value = {
    currentMode,
    setMode,
    disclaimerAccepted,
    setDisclaimerAccepted
  };

  return (
    <ModeContext.Provider value={value}>
      {children}
    </ModeContext.Provider>
  );
}
