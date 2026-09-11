import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import CaseOverview from './components/CaseOverview';
import EvidencePipeline from './components/EvidencePipeline';
import CaseNotesView from './components/CaseNotesView';
import RegistryView from './components/RegistryView';
import LinkAnalysisView from './components/LinkAnalysisView';
import TimelineView from './components/TimelineView';
import AIAssistantView from './components/AIAssistantView';
import Auth from './components/Auth';
import { getCases } from './api/client';

function App() {
  // HOTFIX: Temporarily disable authentication requirement by defaulting to true
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [cases, setCases] = useState([]);
  const [loadingCases, setLoadingCases] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchCases = async () => {
        setLoadingCases(true);
        try {
          const data = await getCases();
          setCases(Array.isArray(data) ? data : []);
        } catch (error) {
          console.error("Failed to fetch cases", error);
        } finally {
          setLoadingCases(false);
        }
      };
      fetchCases();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Auth onAuthSuccess={() => setIsAuthenticated(true)} />;
  }

  const activeCaseId = cases.length > 0 ? cases[0].id : null;

  return (
    <div className="min-h-screen bg-neutral-950 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] flex flex-col font-sans text-neutral-200">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {loadingCases && <div className="p-8 text-neutral-400 text-center animate-pulse">Loading intelligence graph...</div>}
        {!loadingCases && activeTab === 'overview' && <CaseOverview cases={cases} />}
        {!loadingCases && activeTab === 'evidence' && <EvidencePipeline caseId={activeCaseId} />}
        {!loadingCases && activeTab === 'registry' && <RegistryView caseId={activeCaseId} />}
        {!loadingCases && activeTab === 'link_analysis' && <LinkAnalysisView caseId={activeCaseId} />}
        {!loadingCases && activeTab === 'timeline' && <TimelineView caseId={activeCaseId} />}
        {!loadingCases && activeTab === 'case_notes' && <CaseNotesView caseId={activeCaseId} />}
        {!loadingCases && activeTab === 'ai_assistant' && <AIAssistantView caseId={activeCaseId} />}
      </main>
    </div>
  );
}

export default App;
