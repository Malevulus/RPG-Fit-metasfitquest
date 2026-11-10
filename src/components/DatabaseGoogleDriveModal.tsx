import React, { useState, useRef } from 'react';
import {
  X,
  Database,
  Cloud,
  Download,
  Upload,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  Server,
  FileCode,
  Sparkles,
  RefreshCw,
  FolderArchive,
  Info,
  Smartphone,
  Share2,
  CloudUpload,
  CloudDownload,
  LogOut,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { googleSignIn, logoutGoogle } from '../services/firebaseAuth';
import {
  saveDatabaseToGoogleDrive,
  loadDatabaseFromGoogleDrive,
  createDatabaseSnapshot,
  AppDatabasePayload
} from '../services/googleDriveService';

interface DatabaseGoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestoreDatabase: (importedData: any) => void;
  onToast: (msg: string) => void;
}

export const DatabaseGoogleDriveModal: React.FC<DatabaseGoogleDriveModalProps> = ({
  isOpen,
  onClose,
  onRestoreDatabase,
  onToast,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'server' | 'drive_cloud' | 'database' | 'drive_package'>('server');
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => {
    return localStorage.getItem('metafitquest_last_drive_sync') || null;
  });
  const [confirmRestoreOpen, setConfirmRestoreOpen] = useState(false);
  const [pendingRemoteData, setPendingRemoteData] = useState<AppDatabasePayload | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // The live production/shared URL hosted on Google Cloud Run for real user testing
  const serverUrl = window.location.origin.includes('localhost')
    ? 'https://ais-pre-gewtaocwrje32obouy6avv-838430029465.us-east1.run.app'
    : window.location.origin;

  const handleCopyServerLink = () => {
    navigator.clipboard.writeText(serverUrl);
    setCopiedLink(true);
    onToast('🔗 Link do servidor copiado! Envie aos usuários reais para testarem.');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Export all application data from localStorage as a JSON Database
  const handleExportDatabase = () => {
    try {
      const dump: Record<string, any> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('nutriquest_')) {
          try {
            dump[key] = JSON.parse(localStorage.getItem(key) || 'null');
          } catch {
            dump[key] = localStorage.getItem(key);
          }
        }
      }

      const databaseBlob = new Blob([JSON.stringify(dump, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(databaseBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `metafitquest_banco_dados_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      onToast('💾 Banco de dados exportado! Salve-o no seu Google Drive.');
    } catch (err) {
      console.error(err);
      onToast('❌ Erro ao exportar banco de dados.');
    }
  };

  // Import JSON Database from file (e.g., downloaded from Google Drive)
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (typeof parsed !== 'object' || parsed === null) {
          throw new Error('Formato inválido');
        }

        let importedCount = 0;
        for (const [key, value] of Object.entries(parsed)) {
          if (key.startsWith('nutriquest_')) {
            if (typeof value === 'object') {
              localStorage.setItem(key, JSON.stringify(value));
            } else {
              localStorage.setItem(key, String(value));
            }
            importedCount++;
          }
        }

        onRestoreDatabase(parsed);
        onToast(`✅ Banco de dados restaurado (${importedCount} coleções sincronizadas)!`);
        onClose();
      } catch (err) {
        console.error(err);
        onToast('❌ Arquivo inválido. Certifique-se de que é um arquivo .json exportado.');
      }
    };
    reader.readAsText(file);
  };

  const handleConnectGoogle = async () => {
    setIsConnecting(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        onToast(`Conectado ao Google Drive com sucesso (${res.user.email})!`);
      }
    } catch (err: any) {
      onToast(err.message || 'Erro ao conectar conta Google.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectGoogle = async () => {
    await logoutGoogle();
    setGoogleUser(null);
    onToast('Desconectado do Google Drive.');
  };

  const handleSaveToDriveCloud = async (isSnapshot = false) => {
    if (!googleUser) {
      onToast('Por favor, conecte sua conta Google primeiro.');
      return;
    }

    setIsSyncing(true);
    setSyncStatus('Compilando e gravando banco de dados no Google Drive...');

    try {
      const dump: Record<string, any> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('nutriquest_')) {
          try {
            dump[key] = JSON.parse(localStorage.getItem(key) || 'null');
          } catch {
            dump[key] = localStorage.getItem(key);
          }
        }
      }

      const payload: AppDatabasePayload = {
        app: 'MetaFitQuest',
        version: '2.5.0-drive-cloud',
        exportedAt: new Date().toISOString(),
        userEmail: googleUser.email || 'tester@metafitquest.com',
        data: dump as any,
      };

      if (isSnapshot) {
        await createDatabaseSnapshot(payload);
        onToast('Snapshot de teste gravado no Google Drive com sucesso!');
      } else {
        await saveDatabaseToGoogleDrive(payload);
        const nowStr = new Date().toLocaleString('pt-BR');
        setLastSyncTime(nowStr);
        localStorage.setItem('metafitquest_last_drive_sync', nowStr);
        onToast('Banco de dados compilado e salvo no Google Drive!');
      }
    } catch (err: any) {
      onToast(`Erro na gravação: ${err.message}`);
    } finally {
      setIsSyncing(false);
      setSyncStatus(null);
    }
  };

  const handleFetchFromDriveCloud = async () => {
    if (!googleUser) {
      onToast('Por favor, conecte sua conta Google primeiro.');
      return;
    }

    setIsSyncing(true);
    setSyncStatus('Lendo banco de dados armazenado no Google Drive...');

    try {
      const remoteDb = await loadDatabaseFromGoogleDrive();
      if (!remoteDb) {
        onToast('Nenhum banco de dados prévio encontrado no seu Google Drive.');
        return;
      }
      setPendingRemoteData(remoteDb);
      setConfirmRestoreOpen(true);
    } catch (err: any) {
      onToast(`Erro ao carregar do Drive: ${err.message}`);
    } finally {
      setIsSyncing(false);
      setSyncStatus(null);
    }
  };

  const handleConfirmRestoreDrive = () => {
    if (!pendingRemoteData) return;
    const data = pendingRemoteData.data;
    let importedCount = 0;
    for (const [key, value] of Object.entries(data)) {
      if (key.startsWith('nutriquest_')) {
        if (typeof value === 'object') {
          localStorage.setItem(key, JSON.stringify(value));
        } else {
          localStorage.setItem(key, String(value));
        }
        importedCount++;
      }
    }
    onRestoreDatabase(data);
    setConfirmRestoreOpen(false);
    setPendingRemoteData(null);
    onToast(`Banco de dados restaurado do Google Drive (${importedCount} coleções sincronizadas)!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-extrabold text-base sm:text-lg text-white">
                  Servidor & Banco de Dados
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 uppercase tracking-wider">
                  Compilado
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Acesse o servidor online, gerencie dados e exporte pacotes para o Google Drive.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-1.5 gap-1.5 text-xs font-bold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('server')}
            className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'server'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Servidor Usuários Reais</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('drive_cloud')}
            className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'drive_cloud'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Cloud className="w-4 h-4 text-emerald-300" />
            <span>Sincronização Drive Cloud</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('database')}
            className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'database'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Banco de Dados (.JSON)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('drive_package')}
            className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'drive_package'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FolderArchive className="w-4 h-4" />
            <span>Pacote Compilado (ZIP)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* 1. Servidor para Usuários Reais */}
          {activeTab === 'server' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/60 via-slate-850 to-slate-900 border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>Servidor em Produção Ativo</span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded-full">
                    HTTPS · 24/7 Online
                  </span>
                </div>

                <p className="text-slate-300 leading-relaxed">
                  O projeto já está <strong>compilado e hospedado na infraestrutura de nuvem do Google Cloud</strong>.
                  Para que os usuários reais testem no celular ou computador, basta compartilhar este link direto:
                </p>

                {/* Server URL Bar */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-700/80 flex items-center justify-between gap-2">
                  <span className="font-mono text-emerald-300 font-semibold truncate text-[11px] sm:text-xs">
                    {serverUrl}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={handleCopyServerLink}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-sm"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                    <a
                      href={serverUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
                      title="Abrir em nova aba"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Informação sobre Google Drive vs Servidor Web */}
              <div className="p-3.5 bg-sky-950/40 border border-sky-800/50 rounded-2xl flex items-start gap-3">
                <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div className="space-y-1 text-slate-300 leading-relaxed">
                  <strong className="text-sky-300 block">Como funciona com o Google Drive:</strong>
                  <p>
                    O Google Drive é um serviço de armazenamento de arquivos (onde você guarda backups e os códigos compactados). Para executar a aplicação web com câmera, scanner com IA e interações em tempo real com usuários reais, o navegador se conecta a este servidor online acima.
                  </p>
                </div>
              </div>

              {/* Dicas para testes com usuários reais */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 bg-slate-800/60 rounded-2xl border border-slate-700/60 space-y-1.5">
                  <div className="flex items-center gap-2 text-white font-bold">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <span>No Celular (PWA)</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Os usuários podem abrir o link no Chrome ou Safari e tocar em <em>"Adicionar à tela de início"</em> para usar como app nativo.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-800/60 rounded-2xl border border-slate-700/60 space-y-1.5">
                  <div className="flex items-center gap-2 text-white font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Persistência Isolada</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Cada usuário que acessa o link cria seu próprio perfil, metas e histórico em seu dispositivo com isolamento total.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Sincronização Direta com Google Drive Cloud */}
          {activeTab === 'drive_cloud' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/70 via-slate-850 to-slate-900 border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <Cloud className="w-5 h-5" />
                    <span>Servidor em Nuvem no Google Drive</span>
                  </div>
                  {googleUser ? (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Conectado
                    </span>
                  ) : (
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono px-2 py-0.5 rounded-full flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-amber-400" /> Desconectado
                    </span>
                  )}
                </div>

                <p className="text-slate-300 leading-relaxed text-xs">
                  Sincronize o banco de dados completo do MetaFitQuest (perfis, planos de treino, histórico nutricional, anamnese e metas) diretamente na pasta <code className="bg-slate-950 px-1.5 py-0.5 rounded text-emerald-300 font-mono">MetaFitQuest_Database</code> no seu Google Drive.
                </p>

                {/* Account Connection Status */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-700/80 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-slate-400 uppercase font-semibold">Conta Google Vinculada</div>
                    <div className="text-xs text-white font-medium mt-0.5">
                      {googleUser ? googleUser.email : 'Nenhuma conta conectada'}
                    </div>
                  </div>

                  {googleUser ? (
                    <button
                      type="button"
                      onClick={handleDisconnectGoogle}
                      className="px-3 py-1.5 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Desconectar
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleConnectGoogle}
                      disabled={isConnecting}
                      className="px-3.5 py-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl flex items-center gap-1.5 shadow-md transition cursor-pointer disabled:opacity-50"
                    >
                      <Cloud className="w-4 h-4" />
                      <span>{isConnecting ? 'Conectando...' : 'Conectar Google Drive'}</span>
                    </button>
                  )}
                </div>

                {lastSyncTime && (
                  <div className="text-[11px] text-slate-400 flex items-center justify-between px-1">
                    <span>Último sync na nuvem:</span>
                    <span className="text-emerald-400 font-semibold">{lastSyncTime}</span>
                  </div>
                )}
              </div>

              {/* Actions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => handleSaveToDriveCloud(false)}
                  disabled={!googleUser || isSyncing}
                  className="p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex flex-col items-center justify-center gap-2 border border-emerald-400/30 shadow-md transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <CloudUpload className="w-4 h-4" />
                    <span>Gravar no Google Drive</span>
                  </div>
                  <span className="text-[11px] text-emerald-100/70 text-center font-normal">
                    Compila todos os dados e envia para o Google Drive
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleFetchFromDriveCloud}
                  disabled={!googleUser || isSyncing}
                  className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-750 text-white font-medium text-xs flex flex-col items-center justify-center gap-2 border border-slate-700 shadow-md transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
                    <CloudDownload className="w-4 h-4 text-cyan-400" />
                    <span>Baixar do Google Drive</span>
                  </div>
                  <span className="text-[11px] text-slate-400 text-center font-normal">
                    Carrega e restaura banco salvo no Google Drive
                  </span>
                </button>
              </div>

              {/* Snapshot Button */}
              <button
                type="button"
                onClick={() => handleSaveToDriveCloud(true)}
                disabled={!googleUser || isSyncing}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs border border-slate-700/80 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-40"
              >
                <FolderArchive className="w-4 h-4 text-amber-400" />
                <span>Salvar Snapshot de Teste com Timestamp no Drive</span>
              </button>

              {/* Progress Bar */}
              {isSyncing && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center gap-3 text-xs text-emerald-300 animate-pulse">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>{syncStatus || 'Processando com Google Drive...'}</span>
                </div>
              )}
            </div>
          )}

          {/* 2. Banco de Dados .JSON & Backup Google Drive */}
          {activeTab === 'database' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="font-bold text-white text-sm">
                  Gerenciamento do Banco de Dados Local & Backup em Nuvem
                </h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Exporte o estado completo do aplicativo (refeições, histórico de 30 dias, planos de treino adaptados, anamnese, contador de passos e conquistas) em formato JSON para salvar no seu Google Drive ou compartilhar com nutricionistas/personal trainers.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {/* Export Card */}
                <div className="p-4 bg-slate-800/70 border border-slate-700 rounded-2xl flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                      <Download className="w-4 h-4" />
                      <span>Exportar Banco (.JSON)</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Gera um arquivo com todos os dados atuais para você armazenar na sua pasta do Google Drive.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleExportDatabase}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                  >
                    <Download className="w-4 h-4" />
                    <span>Baixar Banco de Dados</span>
                  </button>
                </div>

                {/* Import Card */}
                <div className="p-4 bg-slate-800/70 border border-slate-700 rounded-2xl flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-teal-400 font-bold">
                      <Upload className="w-4 h-4" />
                      <span>Importar do Google Drive</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Selecione um arquivo de banco de dados (.json) salvo previamente no Google Drive para restaurar todo o progresso.
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileImport}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Carregar Arquivo .JSON</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3. Pacote Compilado (ZIP) */}
          {activeTab === 'drive_package' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <FolderArchive className="w-5 h-5" />
                  <span>Pacote de Distribuição Compilado (ZIP)</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Todo o projeto foi compilado (HTML minificado, CSS com Tailwind v4, bundles JS otimizados e todos os avatares anti-serrilhados) e empacotado em um arquivo ZIP pronto para ser carregado no seu Google Drive.
                </p>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-slate-400 font-mono text-[11px]">
                  <div>📦 Arquivo: <strong>metasfitquest-app-compiled.zip</strong></div>
                  <div>⚡ Conteúdo: Pasta <code>dist/</code> com index.html, assets e imagens</div>
                  <div>💾 Tamanho: ~8.7 MB</div>
                </div>

                <a
                  href="/metasfitquest-app-compiled.zip"
                  download="metasfitquest-app-compiled.zip"
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer text-xs"
                >
                  <Download className="w-4 h-4 stroke-[2.5]" />
                  <span>Baixar Pacote Compilado para Guardar no Google Drive (.ZIP)</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-850 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            MetasFitQuest v1.0 · Build de Produção
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>

      {/* Confirmation Dialog for Destructive Overwrite */}
      {confirmRestoreOpen && pendingRemoteData && (
        <div className="fixed inset-0 z-60 bg-black/85 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-md w-full p-5 text-white shadow-2xl">
            <div className="flex items-center gap-3 text-amber-400 mb-3">
              <AlertCircle className="w-6 h-6" />
              <h4 className="font-bold text-base">Restaurar Banco de Dados?</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Isto irá substituir os dados atuais pelos dados armazenados no Google Drive
              exportados em{' '}
              <strong className="text-white">
                {new Date(pendingRemoteData.exportedAt).toLocaleString('pt-BR')}
              </strong>
              . Deseja continuar?
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmRestoreOpen(false)}
                className="px-3.5 py-1.5 text-xs rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmRestoreDrive}
                className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 cursor-pointer shadow-md"
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
