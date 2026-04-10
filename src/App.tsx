import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import Navigation from './components/Navigation';
import OntologyPage from './pages/OntologyPage';
import GraphEditPage from './pages/GraphEditPage';
import DataManagementPage from './pages/DataManagementPage';

const App: React.FC = () => {
  return (
    <Router>
      <Layout className="min-h-screen">
        <Navigation />
        <Layout>
          <Routes>
            <Route path="/" element={<OntologyPage />} />
            <Route path="/graph" element={<GraphEditPage />} />
            <Route path="/data" element={<DataManagementPage />} />
          </Routes>
        </Layout>
      </Layout>
    </Router>
  );
};

export default App;
