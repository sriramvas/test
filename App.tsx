
import React from 'react';
import { ArcherLoader } from './components/ArcherLoader';

const App: React.FC = () => {
  return (
    <div className="w-screen h-screen bg-[#050505] overflow-hidden relative flex items-center justify-center p-4">
        <ArcherLoader />
    </div>
  );
};

export default App;
