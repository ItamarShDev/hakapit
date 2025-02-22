import React, { createContext, useContext, useState } from 'react';

// Create a context
const RootLayoutContext = createContext(null);

// Create a provider component
export const RootLayoutProvider = ({ children }) => {
    const [state, setState] = useState({}); // Add your state here

    return (
        <RootLayoutContext.Provider value={{ state, setState }}>
            {children}
        </RootLayoutContext.Provider>
    );
};

// Custom hook to use the RootLayout context
export const useRootLayout = () => {
    return useContext(RootLayoutContext);
};
