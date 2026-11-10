import React, { useState } from 'react';
import {
  Cloud,
  CloudUpload,
  CloudDownload,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Database,
  Users,
  ShieldCheck,
  FolderOpen,
  LogOut,
  Sparkles,
  X
} from 'lucide-react';
import { googleSignIn, logoutGoogle } from '../services/firebaseAuth';
import {
  saveDatabaseToGoogleDrive,
  loadDatabaseFromGoogleDrive,
  createDatabaseSnapshot,
  AppDatabasePayload
} from '../services/googleDriveService';

interface GoogleDriveSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAppState: any;
  onRestoreState: (state: any) => void;
  showToast: (msg: string) => void;
}

export const GoogleDriveSyncModal: React.FC<GoogleDriveSyncModalProps> = ({
  isOpen,
  onClose,
  currentAppState,
  onRestoreState,
  showToast,
}) => {
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => {
    return localStorage.getItem('metafitquest_last_drive_sync') || null;
  });
  const [confirmRestoreOpen, setConfirmRestoreOpen] = useState(false);
  const [pendingRemoteData, setPendingRemoteData] = useState<AppDatabasePayload | null>(null);

  if (!isOpen) return null;

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        showToast(`Conectado ao Google Drive com sucesso (${res.user.email})!`);
      }
    } catch (err: any) {
      showToast(err.message || 'Erro ao conectar conta Google.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    await logoutGoogle();
    setGoogleUser(null);
    showToast('Desconectado do Google Drive.');
  };

  const handleSaveToDrive = async (isSnapshot = false) => {
    if (!googleUser) {
      showToast('Por favor, conecte sua conta Google primeiro.');
      return;
    }

    setIsSyncing(true);
    setSyncStatus('Compilando e gravando banco de dados no Google Drive...');

    try {
      const payload: AppDatabasePayload = {
        app: 'MetaFitQuest',
        version: '2.5.0-drive-cloud',
        exportedAt: new Date().toISOString(),
        userEmail: googleUser.email || 'tester@metafitquest.com',
        data: currentAppState,
      };

      if (isSnapshot) {
        await createDatabaseSnapshot(payload);
        showToast('Snapshot de teste gerado com sucesso no Google Drive!');
      } else {
        const res = await saveDatabaseToGoogleDrive(payload);
        const nowStr = new Date().toLocaleString('pt-BR');
        setLastSyncTime(nowStr);
        localStorage.setItem('metafitquest_last_drive_sync', nowStr);
        showToast('Banco de dados sincronizado e atualizado no Google Drive!');
      }
    } catch (err: any) {
      showToast(`Erro na gravação: ${err.message}`);
    } finally {
      setIsSyncing(false);
      setSyncStatus(null);
    }
  };

  const handleFetchFromDrive = async () => {
    if (!googleUser) {
      showToast('Por favor, conecte sua conta Google primeiro.');
      return;
    }

    setIsSyncing(true);
    setSyncStatus('Lendo banco de dados armazenado no Google Drive...');

    try {
      const remoteDb = await loadDatabaseFromGoogleDrive();
      if (!remoteDb) {
        showToast('Nenhum banco de dados prévio encontrado no seu Google Drive.');
        return;
      }
      setPendingRemoteData(remoteDb);
      setConfirmRestoreOpen(true);
    } catch (err: any) {
      showToast(`Erro ao carregar do Drive: ${err.message}`);
    } finally {
      setIsSyncing(false);
      setSyncStatus(null);
    }
  };

  const handleConfirmRestore = () => {
    if (!pendingRemoteData) return;
    onRestoreState(pendingRemoteData.data);
    setConfirmRestoreOpen(false);
    setPendingRemoteData(null);
    showToast('Dados restaurados com sucesso a partir do Google Drive!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl max-w-xl w-full p-6 text-white shadow-2xl relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
                Servidor de Banco de Dados Google Drive
                <span className="px-2 py-0.5 text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full font-medium">
                  Testes Reais
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Sincronização persistente na nuvem para testes com usuários reais
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-4 relative z-10">
          {/* Connection Status Card */}
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-700/50 flex items-center justify-center">
                  <Cloud className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                    Status da Conexão
                  </div>
                  <div className="text-sm font-medium text-slate-200">
                    {googleUser ? (
                      <span className="text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Conectado como {googleUser.email}
                      </span>
                    ) : (
                      <span className="text-amber-400 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4" /> Desconectado do Google Drive
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {googleUser ? (
                <button
                  onClick={handleDisconnect}
                  className="px-3 py-1.5 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 rounded-lg flex items-center gap-1.5 transition"
                >
                  <LogOut className="w-3.5 h-3.5" /> Desconectar
                </button>
              ) : (
                <button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="px-4 py-2 text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-lg flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition active:scale-95 disabled:opacity-50"
                >
                  <Cloud className="w-4 h-4" />
                  {isConnecting ? 'Conectando...' : 'Conectar Google Drive'}
                </button>
              )}
            </div>

            {lastSyncTime && (
              <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
                <span>Última sincronização no Drive:</span>
                <span className="text-emerald-400 font-medium">{lastSyncTime}</span>
              </div>
            )}
          </div>

          {/* Explanation Box */}
          <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-500/30 flex items-start gap-3">
            <Users className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-200/90 leading-relaxed">
              <strong className="text-blue-100">Como funciona o Servidor de Teste:</strong> Todos os perfis, refeições, treinos, hidratação e metas de passos são compilados em um JSON centralizado salvo na pasta <code className="bg-blue-900/40 px-1 py-0.5 rounded text-blue-300">MetaFitQuest_Database</code> do seu Google Drive. Isso permite que múltiplos testes mantenham dados reais preservados.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => handleSaveToDrive(false)}
              disabled={!googleUser || isSyncing}
              className="p-3.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white font-medium text-xs flex flex-col items-center justify-center gap-2 border border-emerald-400/30 shadow-lg shadow-emerald-600/20 transition disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <div className="flex items-center gap-2 text-sm font-bold">
                <CloudUpload className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                Sincronizar Banco Atual
              </div>
              <span className="text-[11px] text-emerald-100/70 text-center font-normal">
                Compilar e subir dados atuais para a nuvem
              </span>
            </button>

            <button
              onClick={handleFetchFromDrive}
              disabled={!googleUser || isSyncing}
              className="p-3.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-medium text-xs flex flex-col items-center justify-center gap-2 border border-slate-700 shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
                <CloudDownload className="w-4 h-4 text-cyan-400 group-hover:translate-y-0.5 transition-transform" />
                Baixar / Restaurar Banco
              </div>
              <span className="text-[11px] text-slate-400 text-center font-normal">
                Carregar banco de dados gravado no Drive
              </span>
            </button>
          </div>

          {/* Backup Snapshot */}
          <div className="pt-2">
            <button
              onClick={() => handleSaveToDrive(true)}
              disabled={!googleUser || isSyncing}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white text-xs border border-slate-700/60 flex items-center justify-center gap-2 transition disabled:opacity-40"
            >
              <FolderOpen className="w-4 h-4 text-amber-400" />
              Criar Snapshot de Backup com Timestamp (Auditoria de Teste)
            </button>
          </div>

          {/* Loading / Progress indicator */}
          {isSyncing && (
            <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 flex items-center gap-3 text-xs text-emerald-300 animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
              <span>{syncStatus || 'Processando operação no Google Drive...'}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 relative z-10">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Segurança garantida via OAuth com permissão de arquivo restrita</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition"
          >
            Fechar
          </button>
        </div>
      </div>

      {/* Confirmation Dialog for Destructive Overwrite */}
      {confirmRestoreOpen && pendingRemoteData && (
        <div className="fixed inset-0 z-60 bg-black/85 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-xl max-w-md w-full p-5 text-white shadow-2xl">
            <div className="flex items-center gap-3 text-amber-400 mb-3">
              <AlertCircle className="w-6 h-6" />
              <h4 className="font-bold text-base">Restaurar Banco de Dados?</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Isto irá substituir o estado atual do aplicativo pelos dados armazenados no Google Drive
              exportados em{' '}
              <strong className="text-white">
                {new Date(pendingRemoteData.exportedAt).toLocaleString('pt-BR')}
              </strong>
              . Deseja continuar?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmRestoreOpen(false)}
                className="px-3.5 py-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmRestore}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950"
              >
                Confirmar e Restaurar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
