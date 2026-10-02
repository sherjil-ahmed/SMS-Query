import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { SmsProvider, useSms } from './context/SmsContext';
import { AndroidStatusBar } from './components/AndroidStatusBar';
import { TopAppBar } from './components/TopAppBar';
import { NavigationTabBar, NavTabId } from './components/NavigationTabBar';
import { InboxTab } from './components/InboxTab';
import { QueryBuilderTab } from './components/QueryBuilderTab';
import { ExportTab } from './components/ExportTab';
import { CloudSyncTab } from './components/CloudSyncTab';
import { IncomingSmsBanner } from './components/IncomingSmsBanner';
import { MessageDetailModal } from './components/MessageDetailModal';
import { ReceiveSmsModal } from './components/ReceiveSmsModal';
import { DefaultSmsAppModal } from './components/DefaultSmsAppModal';
import { RealTimeGatewayDrawer } from './components/RealTimeGatewayDrawer';
import { MobileDownloadModal } from './components/MobileDownloadModal';
import { SMSMessage } from './types/sms';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTabId>('inbox');
  const [isDeviceFrame, setIsDeviceFrame] = useState<boolean>(true);
  const [selectedMessage, setSelectedMessage] = useState<SMSMessage | null>(null);
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState<boolean>(false);
  const [isGatewayDrawerOpen, setIsGatewayDrawerOpen] = useState<boolean>(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState<boolean>(false);

  const {
    incomingToast,
    dismissToast,
    toggleRead,
    toggleStar,
    deleteSMS,
    receiveSMS,
    isDefaultSmsApp,
    setIsDefaultSmsApp,
    showDefaultAppModal,
    setShowDefaultAppModal,
  } = useSms();

  return (
    <div className="min-h-screen bg-slate-200 dark:bg-slate-950 flex flex-col items-center justify-start sm:p-4 md:p-6 transition-colors">
      {/* Heads-up Incoming SMS Notification */}
      <IncomingSmsBanner
        message={incomingToast}
        onDismiss={dismissToast}
        onInspect={(msg) => setSelectedMessage(msg)}
        onMarkRead={(id) => toggleRead(id)}
      />

      {/* Main Container / Android Device Mock Frame */}
      <div
        className={`w-full bg-slate-100 dark:bg-slate-950 flex flex-col transition-all duration-300 relative shadow-2xl overflow-hidden phone-frame-wrapper ${
          isDeviceFrame
            ? 'max-w-[440px] h-[100dvh] sm:h-[890px] sm:rounded-[44px] sm:border-[10px] sm:border-slate-800 dark:sm:border-slate-850 ring-1 ring-black/10'
            : 'max-w-4xl min-h-[92vh] sm:rounded-3xl border border-slate-300 dark:border-slate-800'
        }`}
      >
        {/* Android Native Status Bar */}
        <AndroidStatusBar carrier="5G Ultra" />

        {/* Top App Bar Header */}
        <TopAppBar
          onOpenReceiveModal={() => setIsReceiveModalOpen(true)}
          isDeviceFrame={isDeviceFrame}
          onToggleDeviceFrame={() => setIsDeviceFrame(!isDeviceFrame)}
          onOpenGatewayDrawer={() => setIsGatewayDrawerOpen(true)}
          onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
        />

        {/* Main Tab Screen Content */}
        <main className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
          {activeTab === 'inbox' && (
            <InboxTab
              onOpenQueryTab={() => setActiveTab('query')}
              onOpenReceiveModal={() => setIsReceiveModalOpen(true)}
              onSelectMessage={(msg) => setSelectedMessage(msg)}
              onRequestSetDefault={() => setShowDefaultAppModal(true)}
              onOpenGatewayInfo={() => setIsGatewayDrawerOpen(true)}
            />
          )}

          {activeTab === 'query' && (
            <QueryBuilderTab onViewResults={() => setActiveTab('inbox')} />
          )}

          {activeTab === 'export' && <ExportTab />}

          {activeTab === 'sync' && <CloudSyncTab />}
        </main>

        {/* Bottom Android Gesture Navigation Bar indicator (if device frame is active) */}
        {isDeviceFrame && (
          <div className="w-full flex items-center justify-center pt-1 pb-1.5 bg-white/95 dark:bg-slate-900/95 absolute bottom-0 left-0 right-0 z-50 pointer-events-none no-print">
            <div className="w-32 h-1 bg-slate-400 dark:bg-slate-600 rounded-full" />
          </div>
        )}

        {/* Bottom Tab Navigation */}
        <NavigationTabBar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Message Inspection Detail Modal */}
      {selectedMessage && (
        <MessageDetailModal
          message={selectedMessage}
          onClose={() => setSelectedMessage(null)}
          onToggleStar={toggleStar}
          onDelete={deleteSMS}
        />
      )}

      {/* Receive SMS Simulator Modal */}
      <ReceiveSmsModal
        isOpen={isReceiveModalOpen}
        onClose={() => setIsReceiveModalOpen(false)}
        onReceive={(data) => receiveSMS(data)}
      />

      {/* Android System Intent: Change Default SMS App Modal */}
      <DefaultSmsAppModal
        isOpen={showDefaultAppModal}
        onClose={() => setShowDefaultAppModal(false)}
        onConfirmDefault={() => setIsDefaultSmsApp(true)}
        isCurrentlyDefault={isDefaultSmsApp}
      />

      {/* Live Telephony Gateway & Webhook Drawer */}
      <RealTimeGatewayDrawer
        isOpen={isGatewayDrawerOpen}
        onClose={() => setIsGatewayDrawerOpen(false)}
        onRequestSetDefault={() => setShowDefaultAppModal(true)}
      />

      {/* Mobile Installation & APK Download Center */}
      <MobileDownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <SmsProvider>
        <AppContent />
      </SmsProvider>
    </ThemeProvider>
  );
}
