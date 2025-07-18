import React from 'react';
import MediaLibraryWithUpload from './components/MediaLibraryWithUpload';
import UploadQueue from './components/UploadQueue';
import BudgetEditor from './components/BudgetEditor';
import CriarCampanha from './pages/CriarCampanha';

const App: React.FC = () => (
  <div className="app-container">
    <MediaLibraryWithUpload />
    <UploadQueue />
    <BudgetEditor />
    <CriarCampanha />
  </div>
);

export default App;
