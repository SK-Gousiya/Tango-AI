import React from 'react';
// Corrected imports to use direct file names for compilation environment compatibility
import MindMapPage from 'MindMapPage'; 
import 'App.css'; // Import global styles

const App = () => {
  return (
    <div className="App">
      <MindMapPage />
    </div>
  );
};

export default App;