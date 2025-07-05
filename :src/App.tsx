import React from 'react';
import MediaLibraryWithUpload from '../MediaLibraryWithUpload';
import UploadQueue from './components/UploadQueue';
import BudgetEditor from './components/BudgetEditor';
import CampaignEditor from './components/CampaignEditor';
import Reports from './components/Reports';

const App: React.FC = () => (
  <div className="app-container">
    <MediaLibraryWithUpload />
    <UploadQueue />
    <BudgetEditor />
    <CampaignEditor />
    <Reports />
  </div>
);

export default App;
