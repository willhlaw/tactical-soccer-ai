import React, { useState, useEffect } from 'react';
import { Team, Player, FormationPreset, FormatType, TeamRole } from './types';
import { getLocalTeams, saveLocalTeams, getActiveTeamId, setActiveTeamId, getAIProStatus, setAIProStatus, getLocalCustomDrills, getLocalScenarios } from './services/storage';
import { auth, onAuthStateChanged, User, logoutUser, syncAllLocalToCloud, fetchUserTeams, syncTeamToCloud, generateInviteCode } from './services/firebase';
import { FORMATION_PRESETS } from './services/formations';
import { TacticsBoard } from './components/tactics/TacticsBoard';
import { GameDayManager } from './components/gameday/GameDayManager';
import { RosterView } from './components/roster/RosterView';
import { PracticeHub } from './components/practice/PracticeHub';
import { AICoachModal } from './components/ai/AICoachModal';
import { LandingPage } from './components/landing/LandingPage';
import { AuthModal } from './components/auth/AuthModal';
import { TeamSwitcher } from './components/team/TeamSwitcher';
import { TeamInviteModal } from './components/team/TeamInviteModal';
import { JoinTeamModal } from './components/team/JoinTeamModal';
import { Shield, Users, Clock, BookOpen, Bot, Sparkles, Wifi, WifiOff, Zap, Plus, ArrowLeft, LogIn, LogOut, Cloud, UserCheck } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'app'>('landing');
  const [activeTab, setActiveTab] = useState<'tactics' | 'gameday' | 'roster' | 'practice'>('tactics');
  const [teams, setTeams] = useState<Team[]>(getLocalTeams);
  const [activeTeamId, setActiveTeamIdState] = useState<string>(getActiveTeamId);
  const [isAIPro, setIsAIPro] = useState<boolean>(getAIProStatus);
  const [isAICoachOpen, setIsAICoachOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Firebase Auth & Modal States 🔐
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState<boolean>(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(err => console.log('SW registration failed:', err));
    }

    // Handle share link URL parameters (e.g. ?join=STRIKE-7890)
    const params = new URLSearchParams(window.location.search);
    if (params.get('join')) {
      setCurrentView('app');
      setIsJoinModalOpen(true);
    } else if (params.get('drill')) {
      setCurrentView('app');
      setActiveTab('practice');
    }

    // Firebase Auth Listener
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Sync local guest work to cloud automatically upon auth
        const localDrills = getLocalCustomDrills();
        const localScenarios = getLocalScenarios();
        await syncAllLocalToCloud(user, teams, localDrills, localScenarios);

        // Load user cloud teams
        const cloudTeams = await fetchUserTeams(user.uid);
        if (cloudTeams.length > 0) {
          setTeams(cloudTeams);
          saveLocalTeams(cloudTeams);
          if (!cloudTeams.some(t => t.id === activeTeamId)) {
            setActiveTeamIdState(cloudTeams[0].id);
            setActiveTeamId(cloudTeams[0].id);
          }
        }
      }
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, []);

  const activeTeam = teams.find(t => t.id === activeTeamId) || teams[0];

  // Derive active user role on active team
  const currentMember = activeTeam?.members?.find(m => m.uid === currentUser?.uid);
  const currentUserRole: TeamRole = currentMember ? currentMember.role : (activeTeam?.ownerId === currentUser?.uid ? 'coach' : 'coach');

  const handleSelectTeam = (teamId: string) => {
    setActiveTeamIdState(teamId);
    setActiveTeamId(teamId);
  };

  const handleUpdateTeam = (updatedTeam: Team) => {
    const newTeams = teams.map(t => t.id === updatedTeam.id ? updatedTeam : t);
    setTeams(newTeams);
    saveLocalTeams(newTeams);
    if (currentUser) {
      syncTeamToCloud(updatedTeam, currentUser);
    }
  };

  const handleCreateNewTeam = () => {
    const newTeamId = 'team-' + Date.now();
    const newTeam: Team = {
      id: newTeamId,
      name: `Team ${teams.length + 1}`,
      ageGroup: 'U11-U12',
      format: '9v9',
      playingStyle: 'youth-buildout',
      ownerId: currentUser?.uid || 'guest-owner',
      inviteCode: generateInviteCode(`Team ${teams.length + 1}`),
      members: currentUser ? [{
        uid: currentUser.uid,
        email: currentUser.email || '',
        displayName: currentUser.displayName || 'Head Coach',
        role: 'coach',
        joinedAt: new Date().toISOString()
      }] : [],
      roster: [
        { id: 'p1', name: 'Alex Martinez', number: 10, isAbsent: false, preferredPositions: ['ST'], attributes: { speed: 8, dribbling: 8, passing: 8, stamina: 7, defending: 5 } },
        { id: 'p2', name: 'Liam Henderson', number: 1, isAbsent: false, preferredPositions: ['GK'], attributes: { speed: 6, dribbling: 5, passing: 7, stamina: 7, defending: 9 } }
      ]
    };

    const updated = [newTeam, ...teams];
    setTeams(updated);
    saveLocalTeams(updated);
    handleSelectTeam(newTeamId);
    if (currentUser) {
      syncTeamToCloud(newTeam, currentUser);
    }
  };

  const handleJoinTeamSuccess = (joinedTeam: Team) => {
    const existingIdx = teams.findIndex(t => t.id === joinedTeam.id);
    let updated;
    if (existingIdx >= 0) {
      updated = teams.map((t, i) => i === existingIdx ? joinedTeam : t);
    } else {
      updated = [joinedTeam, ...teams];
    }
    setTeams(updated);
    saveLocalTeams(updated);
    handleSelectTeam(joinedTeam.id);
    setIsJoinModalOpen(false);
  };

  const handleAuthSuccess = async (user: User) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);

    // Sync guest work to cloud
    const localDrills = getLocalCustomDrills();
    const localScenarios = getLocalScenarios();
    await syncAllLocalToCloud(user, teams, localDrills, localScenarios);

    const cloudTeams = await fetchUserTeams(user.uid);
    if (cloudTeams.length > 0) {
      setTeams(cloudTeams);
      saveLocalTeams(cloudTeams);
      setActiveTeamIdState(cloudTeams[0].id);
      setActiveTeamId(cloudTeams[0].id);
    }
  };

  const handleFormatChange = (format: FormatType) => {
    const updated = { ...activeTeam, format };
    handleUpdateTeam(updated);
  };

  const handleTogglePro = () => {
    const nextState = !isAIPro;
    setIsAIPro(nextState);
    setAIProStatus(nextState);
  };

  const activeFormation = FORMATION_PRESETS.find(f => f.format === activeTeam.format) || FORMATION_PRESETS[2];

  if (currentView === 'landing') {
    return (
      <LandingPage
        onLaunchApp={() => setCurrentView('app')}
        onSelectProTier={() => {
          setIsAIPro(true);
          setAIProStatus(true);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white flex flex-col">
      {/* App Header */}
      <header className="glass-panel sticky top-0 z-40 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Left: Brand, Back to Landing & Team Switcher */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setCurrentView('landing')}
              className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-800 transition"
              title="Return to Landing Page"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-2">
              <div className="p-2 bg-emerald-500 text-slate-950 rounded-xl font-black text-sm">
                TS
              </div>
              <h1 className="text-base font-black text-white hidden sm:block">TacticalSoccer AI</h1>
            </div>

            {/* Team Switcher Dropdown */}
            <TeamSwitcher
              teams={teams}
              activeTeam={activeTeam}
              userRole={currentUserRole}
              onSelectTeam={handleSelectTeam}
              onCreateTeam={handleCreateNewTeam}
              onOpenInviteModal={() => setIsInviteModalOpen(true)}
              onOpenJoinModal={() => setIsJoinModalOpen(true)}
            />
          </div>

          {/* Right Controls: Auth Profile, Format Selector, Sync Status, AI Pro Badge */}
          <div className="flex items-center space-x-3">
            {/* Age Format Selector */}
            <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              {(['5v5', '7v7', '9v9', '11v11'] as const).map(fmt => (
                <button
                  key={fmt}
                  onClick={() => handleFormatChange(fmt)}
                  className={`px-2 py-1 rounded-lg font-bold text-[11px] transition ${
                    activeTeam.format === fmt ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>

            {/* Firebase Auth Profile Button / Badge 🔐 */}
            {currentUser ? (
              <div className="flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white hidden lg:inline">{currentUser.displayName || currentUser.email?.split('@')[0]}</span>
                <button
                  onClick={() => logoutUser()}
                  className="p-1 hover:text-red-400 text-slate-400 transition"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setAuthModalMode('signin');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-xs rounded-xl border border-slate-700 transition"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setAuthModalMode('signup');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1 shadow-md shadow-emerald-500/20 active:scale-95 transition"
                >
                  <Cloud className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </button>
              </div>
            )}

            {/* Sync Badge */}
            <div className={`hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold border ${
              isOnline
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
            }`}>
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span>{isOnline ? 'Cloud Synced' : 'Offline Mode'}</span>
            </div>

            {/* AI Pro Toggle Button */}
            <button
              onClick={handleTogglePro}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border flex items-center gap-1.5 ${
                isAIPro
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{isAIPro ? 'AI Pro' : 'Free Tier'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 flex items-center space-x-1 overflow-x-auto text-xs font-bold border-t border-slate-900">
          <button
            onClick={() => setActiveTab('tactics')}
            className={`px-4 py-3 flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'tactics' ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4" /> Tactics Board
          </button>

          <button
            onClick={() => setActiveTab('gameday')}
            className={`px-4 py-3 flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'gameday' ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" /> Game Day &amp; Subs
          </button>

          <button
            onClick={() => setActiveTab('roster')}
            className={`px-4 py-3 flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'roster' ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" /> Roster &amp; Profiles
          </button>

          <button
            onClick={() => setActiveTab('practice')}
            className={`px-4 py-3 flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'practice' ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Practice Hub
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        {activeTab === 'tactics' && (
          <TacticsBoard team={activeTeam} onUpdateTeam={handleUpdateTeam} />
        )}

        {activeTab === 'gameday' && (
          <GameDayManager
            team={activeTeam}
            onUpdateTeam={handleUpdateTeam}
          />
        )}

        {activeTab === 'roster' && (
          <RosterView team={activeTeam} onUpdateTeam={handleUpdateTeam} />
        )}

        {activeTab === 'practice' && (
          <PracticeHub team={activeTeam} />
        )}
      </main>

      {/* Floating AI Voice & Chat Assistant Button */}
      <button
        onClick={() => setIsAICoachOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold rounded-full shadow-2xl hover:scale-105 transition-all flex items-center gap-2.5 ring-4 ring-emerald-500/20"
      >
        <Bot className="w-6 h-6 fill-current" />
        <span className="text-xs font-black hidden sm:inline">AI Coach</span>
        {isAIPro && <Sparkles className="w-4 h-4 text-amber-950" />}
      </button>

      {/* AI Coach Assistant Modal */}
      <AICoachModal
        team={activeTeam}
        currentFormation={activeFormation}
        isOpen={isAICoachOpen}
        onClose={() => setIsAICoachOpen(false)}
      />

      {/* Auth Modal 🔐 */}
      {isAuthModalOpen && (
        <AuthModal
          initialMode={authModalMode}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      )}

      {/* Team Invite Modal 📩 */}
      {isInviteModalOpen && (
        <TeamInviteModal
          team={activeTeam}
          currentUserId={currentUser?.uid}
          onClose={() => setIsInviteModalOpen(false)}
        />
      )}

      {/* Join Team Modal 🔑 */}
      {isJoinModalOpen && (
        <JoinTeamModal
          user={currentUser}
          onClose={() => setIsJoinModalOpen(false)}
          onJoinSuccess={handleJoinTeamSuccess}
        />
      )}
    </div>
  );
}
