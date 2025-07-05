import React from 'react';
import MediaLibraryWithUpload from './components/MediaLibraryWithUpload';
import UploadQueue from './components/UploadQueue';
import BudgetEditor from './components/BudgetEditor';
import CampaignEditor from './components/CampaignEditor';
import Reports from './components/Reports';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App: React.FC = () => (
  <div className="app-container">
    <MediaLibraryWithUpload />
    <UploadQueue />
    <BudgetEditor />
    <CampaignEditor />
    <Reports />
    <ToastContainer position="top-right" />
  </div>
);

export default App;
