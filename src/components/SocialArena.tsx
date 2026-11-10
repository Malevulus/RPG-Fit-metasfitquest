import React, { useState, useRef } from 'react';
import {
  SocialChallenge,
  SocialProofPost,
  LeaderboardUser,
  UserProfile,
} from '../types';
import {
  Trophy,
  Users,
  Flame,
  Coins,
  Camera,
  Heart,
  MessageCircle,
  Share2,
  Plus,
  CheckCircle,
  Clock,
  Sparkles,
  Award,
  Filter,
  Send,
  Upload,
  X,
  Target,
  Gift,
  ThumbsUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SocialArenaProps {
  user: UserProfile;
  healthCoins: number;
  streakDays: number;
  challenges: SocialChallenge[];
  posts: SocialProofPost[];
  leaderboard: LeaderboardUser[];
  onJoinChallenge: (challengeId: string) => void;
  onAdvanceChallengeDay: (challengeId: string) => void;
  onClaimChallengeReward: (challengeId: string, rewardCoins: number) => void;
  onCreateChallenge: (newChallenge: Omit<SocialChallenge, 'id' | 'participantsCount' | 'isJoined' | 'progressDays' | 'isCompleted' | 'rewardClaimed'>) => void;
  onCreateProofPost: (post: Omit<SocialProofPost, 'id' | 'timestamp' | 'likesCount' | 'hasLiked' | 'reactions' | 'comments'>) => void;
  onLikePost: (postId: string) => void;
  onReactPost: (postId: string, reactionType: 'fire' | 'heart' | 'clap') => void;
  onAddComment: (postId: string, commentText: string) => void;
}

const PRESET_PROOF_PHOTOS = [
  { label: '🥗 Prato de Almoço Saudável', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80' },
  { label: '💧 Garrafa de Água no Foco', url: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=600&auto=format&fit=crop&q=80' },
  { label: '🍓 Frutas e Lanche Fit', url: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=600&auto=format&fit=crop&q=80' },
  { label: '🍳 Ovos Mexidos e Café da Manhã', url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80' },
];

export const SocialArena: React.FC<SocialArenaProps> = ({
  user,
  healthCoins,
  streakDays,
  challenges,
  posts,
  leaderboard,
  onJoinChallenge,
  onAdvanceChallengeDay,
  onClaimChallengeReward,
  onCreateChallenge,
  onCreateProofPost,
  onLikePost,
  onReactPost,
  onAddComment,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'feed' | 'challenges' | 'leaderboard'>('feed');
  const [createChallengeOpen, setCreateChallengeOpen] = useState(false);
  const [createPostOpen, setCreatePostOpen] = useState(false);

  // New challenge form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDuration, setNewDuration] = useState(7);
  const [newCategory, setNewCategory] = useState<'nutricao' | 'hidratacao' | 'atividade' | 'habitos'>('nutricao');
  const [newReward, setNewReward] = useState(100);

  // New proof post form state
  const [postChallengeId, setPostChallengeId] = useState('');
  const [postCaption, setPostCaption] = useState('');
  const [postImageUrl, setPostImageUrl] = useState(PRESET_PROOF_PHOTOS[0].url);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Filter posts by challenge if needed
  const [selectedChallengeFilter, setSelectedChallengeFilter] = useState<string>('all');

  const filteredPosts = posts.filter((p) =>
    selectedChallengeFilter === 'all' ? true : p.challengeId === selectedChallengeFilter
  );

  const handleCreateChallengeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onCreateChallenge({
      title: newTitle.trim(),
      description: newDescription.trim() || 'Desafio comunitário de hábitos saudáveis.',
      category: newCategory,
      durationDays: newDuration,
      daysRemaining: newDuration,
      rewardCoins: newReward,
      creatorName: user.name.split(' ')[0],
      icon: newCategory === 'hidratacao' ? '💧' : newCategory === 'nutricao' ? '🥗' : newCategory === 'atividade' ? '🏃' : '✨',
    });

    setNewTitle('');
    setNewDescription('');
    setCreateChallengeOpen(false);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
  };

  const handleCreatePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postCaption.trim()) return;

    const matchedChallenge = challenges.find((c) => c.id === postChallengeId);

    onCreateProofPost({
      authorName: user.name,
      authorAvatar: '',
      challengeId: postChallengeId || undefined,
      challengeTitle: matchedChallenge?.title || undefined,
      imageUrl: postImageUrl,
      caption: postCaption.trim(),
    });

    if (postChallengeId) {
      onAdvanceChallengeDay(postChallengeId);
    }

    setPostCaption('');
    setCreatePostOpen(false);
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPostImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCommentSubmit = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    onAddComment(postId, text);
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Module Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-slate-900 flex items-center gap-2.5">
            <Users className="w-6 h-6 text-emerald-600" />
            Arena Social & Competição
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Participe de desafios com metas em dias, comprove suas conquistas com fotos e dispute o ranque de HealthCoins!
          </p>
        </div>

        {/* Quick CTA Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCreatePostOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>Publicar Foto de Atividade</span>
          </button>
          <button
            onClick={() => setCreateChallengeOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>Criar Desafio</span>
          </button>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl w-full sm:w-max border border-slate-200/60">
        <button
          onClick={() => setActiveSubTab('feed')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'feed'
              ? 'bg-white text-emerald-800 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Camera className="w-4 h-4 text-emerald-600" />
          <span>Hub de Fotos & Comprovações</span>
        </button>

        <button
          onClick={() => setActiveSubTab('challenges')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'challenges'
              ? 'bg-white text-emerald-800 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Target className="w-4 h-4 text-emerald-600" />
          <span>Desafios com Metas ({challenges.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('leaderboard')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'leaderboard'
              ? 'bg-white text-emerald-800 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-500" />
          <span>Ranque & Premiação</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. HUB DE FOTOS & COMPROVAÇÕES (FEED SOCIAL) */}
      {/* ========================================================================= */}
      {activeSubTab === 'feed' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Filter className="w-4 h-4 text-emerald-600" />
              <span>Filtrar por Desafio:</span>
              <select
                value={selectedChallengeFilter}
                onChange={(e) => setSelectedChallengeFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-2.5 py-1 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="all">Todos os Desafios Comprovados</option>
                {challenges.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <span className="text-xs text-slate-400 font-medium">
              {filteredPosts.length} comprovações compartilhadas
            </span>
          </div>

          {/* Posts Feed Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-all group"
              >
                {/* Author Header */}
                <div className="p-4 flex items-center justify-between border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    {post.authorAvatar ? (
                      <img
                        src={post.authorAvatar}
                        alt={post.authorName}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                        {post.authorName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        {post.authorName}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {post.timestamp}
                      </p>
                    </div>
                  </div>

                  {post.challengeTitle && (
                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-2 py-0.5 rounded-full truncate max-w-[130px]">
                      {post.challengeTitle}
                    </span>
                  )}
                </div>

                {/* Photo Container */}
                <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                  <img
                    src={post.imageUrl}
                    alt="Comprovação da atividade"
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                    <span>Validado</span>
                  </div>
                </div>

                {/* Caption & Interactions */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {post.caption}
                  </p>

                  {/* Reaction Bar */}
                  <div className="pt-2 border-t border-slate-100 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onReactPost(post.id, 'fire')}
                          className="px-2 py-1 bg-slate-50 hover:bg-orange-50 text-slate-700 hover:text-orange-600 rounded-lg border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer text-[11px]"
                          title="Fogo / Mandou bem!"
                        >
                          <span>🔥</span>
                          <span className="font-bold font-mono">{post.reactions.fire}</span>
                        </button>
                        <button
                          onClick={() => onReactPost(post.id, 'heart')}
                          className="px-2 py-1 bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-600 rounded-lg border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer text-[11px]"
                          title="Curtir / Apoiar"
                        >
                          <span>❤️</span>
                          <span className="font-bold font-mono">{post.reactions.heart}</span>
                        </button>
                        <button
                          onClick={() => onReactPost(post.id, 'clap')}
                          className="px-2 py-1 bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-600 rounded-lg border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer text-[11px]"
                          title="Inspirador / Parabéns"
                        >
                          <span>👏</span>
                          <span className="font-bold font-mono">{post.reactions.clap}</span>
                        </button>
                      </div>

                      <span className="text-[11px] text-slate-400">
                        {post.comments.length} comentários
                      </span>
                    </div>

                    {/* Comments snippet */}
                    {post.comments.length > 0 && (
                      <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100 max-h-24 overflow-y-auto text-[11px]">
                        {post.comments.slice(-2).map((c) => (
                          <div key={c.id} className="leading-snug">
                            <span className="font-bold text-slate-800">{c.authorName}: </span>
                            <span className="text-slate-600">{c.text}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Quick comment input */}
                    <div className="flex gap-1.5 pt-1">
                      <input
                        type="text"
                        placeholder="Deixe um incentivo..."
                        value={commentInputs[post.id] || ''}
                        onChange={(e) =>
                          setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleCommentSubmit(post.id);
                        }}
                        className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        onClick={() => handleCommentSubmit(post.id)}
                        className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors cursor-pointer"
                        title="Enviar incentivo"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. DESAFIOS COM METAS EM DIAS & PREMIAÇÕES */}
      {/* ========================================================================= */}
      {activeSubTab === 'challenges' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {challenges.map((challenge) => {
              const progressPercent = Math.min(
                100,
                Math.round((challenge.progressDays / challenge.durationDays) * 100)
              );
              const isFinished = challenge.progressDays >= challenge.durationDays;

              return (
                <div
                  key={challenge.id}
                  className={`bg-white rounded-3xl border p-5 shadow-sm transition-all flex flex-col justify-between ${
                    challenge.isJoined
                      ? 'border-emerald-200/90 bg-gradient-to-br from-emerald-50/20 via-white to-slate-50/20'
                      : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div>
                    {/* Header with icon and reward badge */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl p-2.5 bg-slate-50 rounded-2xl border border-slate-100">
                          {challenge.icon}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-display font-bold text-sm text-slate-900">
                              {challenge.title}
                            </h3>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            Criado por <span className="font-semibold text-slate-600">{challenge.creatorName}</span> · {challenge.participantsCount} participantes
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold font-mono shrink-0">
                        <Coins className="w-3.5 h-3.5 text-amber-600" />
                        <span>+{challenge.rewardCoins} HC</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      {challenge.description}
                    </p>

                    {/* Goal Days & Progress Bar */}
                    <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-100 space-y-2 mb-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-emerald-600" />
                          Meta: {challenge.durationDays} dias de execução
                        </span>
                        <span className="font-bold font-mono text-emerald-800">
                          {challenge.isJoined
                            ? `${challenge.progressDays} de ${challenge.durationDays} dias (${progressPercent}%)`
                            : `Faltam ${challenge.daysRemaining} dias para encerrar`}
                        </span>
                      </div>

                      <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isFinished
                              ? 'bg-gradient-to-r from-amber-400 to-emerald-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${progressPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                    {challenge.isJoined ? (
                      <>
                        {isFinished ? (
                          challenge.rewardClaimed ? (
                            <div className="w-full py-2 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2">
                              <CheckCircle className="w-4 h-4 text-emerald-600" />
                              Desafio Concluído e Recompensa Resgatada!
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                onClaimChallengeReward(challenge.id, challenge.rewardCoins);
                                confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
                              }}
                              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                            >
                              <Gift className="w-4 h-4" />
                              Resgatar Premiação (+{challenge.rewardCoins} HealthCoins)
                            </button>
                          )
                        ) : (
                          <div className="w-full flex items-center gap-2">
                            <button
                              onClick={() => {
                                setPostChallengeId(challenge.id);
                                setCreatePostOpen(true);
                              }}
                              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                            >
                              <Camera className="w-3.5 h-3.5" />
                              Comprovar Dia com Foto (+25 HC)
                            </button>
                            <button
                              onClick={() => onAdvanceChallengeDay(challenge.id)}
                              className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                              title="Check-in rápido"
                            >
                              Check-in
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <button
                        onClick={() => onJoinChallenge(challenge.id)}
                        className="w-full py-2.5 bg-slate-900 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Target className="w-4 h-4 text-emerald-400" />
                        Participar do Desafio
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. RANQUE & PREMIAÇÃO DE COMPETIÇÃO ENTRE USUÁRIOS */}
      {/* ========================================================================= */}
      {activeSubTab === 'leaderboard' && (
        <div className="space-y-6">
          {/* Season Podium Banners */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-1 rounded-full">
                  Temporada Outubro 2026
                </span>
                <h2 className="text-xl sm:text-2xl font-display font-extrabold mt-2">
                  Ranque de Hábitos & HealthCoins
                </h2>
                <p className="text-xs text-slate-300 mt-1 max-w-md">
                  Acumule moedas registrando refeições, cumprindo metas de água e completando desafios pontuais com fotos.
                </p>
              </div>

              {/* Season Rewards Box */}
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 text-xs">
                <div className="text-center px-2">
                  <span className="text-xl block">🥇</span>
                  <span className="font-bold text-amber-300">+500 HC</span>
                  <span className="text-[10px] text-slate-400 block">1º Lugar</span>
                </div>
                <div className="h-8 w-px bg-white/20"></div>
                <div className="text-center px-2">
                  <span className="text-xl block">🥈</span>
                  <span className="font-bold text-slate-200">+300 HC</span>
                  <span className="text-[10px] text-slate-400 block">2º Lugar</span>
                </div>
                <div className="h-8 w-px bg-white/20"></div>
                <div className="text-center px-2">
                  <span className="text-xl block">🥉</span>
                  <span className="font-bold text-amber-400">+150 HC</span>
                  <span className="text-[10px] text-slate-400 block">3º Lugar</span>
                </div>
              </div>
            </div>
          </div>

          {/* Leaderboard Table List */}
          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
              <span>Posição & Usuário</span>
              <div className="flex items-center gap-8 sm:gap-14">
                <span>Sequência</span>
                <span>Desafios</span>
                <span>Pontuação</span>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {leaderboard.map((competitor) => {
                const isUser = competitor.isCurrentUser;

                return (
                  <div
                    key={competitor.id}
                    className={`p-4 sm:p-5 flex items-center justify-between transition-colors ${
                      isUser
                        ? 'bg-emerald-50/70 border-l-4 border-l-emerald-600'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Rank & User Info */}
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-8 text-center font-display font-extrabold text-sm sm:text-base text-slate-700">
                        {competitor.rank === 1 && '🥇'}
                        {competitor.rank === 2 && '🥈'}
                        {competitor.rank === 3 && '🥉'}
                        {competitor.rank > 3 && `#${competitor.rank}`}
                      </div>

                      {competitor.avatar ? (
                        <img
                          src={competitor.avatar}
                          alt={competitor.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                          {competitor.name.charAt(0)}
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                            {isUser ? `${user.name} (Você)` : competitor.name}
                          </h4>
                          {isUser && (
                            <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded">
                              Você
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {competitor.rank <= 3 ? 'No Pódio da Temporada' : 'Competidor Ativo'}
                        </span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 sm:gap-12 text-xs">
                      {/* Streak */}
                      <div className="flex items-center gap-1 font-mono font-bold text-amber-800">
                        <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span>{isUser ? streakDays : competitor.streakDays}d</span>
                      </div>

                      {/* Challenges Completed */}
                      <div className="hidden sm:flex items-center gap-1 font-mono font-bold text-slate-700">
                        <Target className="w-4 h-4 text-emerald-600" />
                        <span>{competitor.challengesCompleted}</span>
                      </div>

                      {/* HealthCoins */}
                      <div className="flex items-center gap-1 font-mono font-bold text-yellow-900 bg-yellow-100/70 border border-yellow-300/60 px-2.5 py-1 rounded-xl">
                        <Coins className="w-3.5 h-3.5 text-yellow-600" />
                        <span>{isUser ? healthCoins : competitor.healthCoins} HC</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CRIAR NOVO DESAFIO PONTUAL COM META EM DIAS */}
      {/* ========================================================================= */}
      {createChallengeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900">
                    Criar Desafio Comunitário
                  </h3>
                  <p className="text-xs text-slate-500">
                    Defina uma meta em dias e premiação para engajar os participantes
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCreateChallengeOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateChallengeSubmit} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Título do Desafio *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 5 Dias de Café da Manhã Proteico"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descrição e Regras da Meta
                </label>
                <textarea
                  rows={2}
                  placeholder="Explique o que os participantes devem fazer a cada dia..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Meta em Dias (Prazo)
                  </label>
                  <select
                    value={newDuration}
                    onChange={(e) => setNewDuration(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value={3}>3 Dias (Rápido)</option>
                    <option value={5}>5 Dias (Dias Úteis)</option>
                    <option value={7}>7 Dias (1 Semana Completa)</option>
                    <option value={10}>10 Dias (Foco Total)</option>
                    <option value={14}>14 Dias (2 Semanas)</option>
                    <option value={21}>21 Dias (Novo Hábito)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Categoria
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="nutricao">🥗 Nutrição / Prato</option>
                    <option value="hidratacao">💧 Hidratação</option>
                    <option value="atividade">🏃 Atividade Física</option>
                    <option value="habitos">✨ Hábitos Gerais</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Premiação ao Finalizar (HealthCoins)
                </label>
                <input
                  type="number"
                  min="50"
                  max="500"
                  step="10"
                  value={newReward}
                  onChange={(e) => setNewReward(parseInt(e.target.value, 10) || 50)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  Publicar Desafio na Comunidade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PUBLICAR FOTO / COMPROVAÇÃO DE ATIVIDADE */}
      {/* ========================================================================= */}
      {createPostOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900">
                    Comprovar Atividade com Foto
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ganhe +25 HealthCoins e inspire outros competidores!
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCreatePostOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePostSubmit} className="p-6 overflow-y-auto space-y-4">
              {/* Challenge link selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Vincular a um Desafio em Execução
                </label>
                <select
                  value={postChallengeId}
                  onChange={(e) => setPostChallengeId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="">Sem vínculo específico (Post Livre)</option>
                  {challenges.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.durationDays} dias)
                    </option>
                  ))}
                </select>
              </div>

              {/* Photo preview and selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Foto da Comprovação (Prato, Água ou Atividade)
                </label>
                <div className="relative aspect-16/9 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 mb-2">
                  <img
                    src={postImageUrl}
                    alt="Preview da foto"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 right-2 flex gap-1.5">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageFileChange}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 bg-black/70 hover:bg-black/90 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Enviar Foto Própria
                    </button>
                  </div>
                </div>

                {/* Quick preset photo buttons */}
                <span className="text-[11px] text-slate-500 block mb-1">
                  Ou selecione uma foto de exemplo para teste rápido:
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {PRESET_PROOF_PHOTOS.map((photo, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPostImageUrl(photo.url)}
                      className={`p-1.5 text-[11px] rounded-lg border text-left truncate transition-colors cursor-pointer ${
                        postImageUrl === photo.url
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {photo.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Caption */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Legenda / Relato da Conquista *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Compartilhe como foi cumprir a atividade hoje, os ingredientes ou sua sensação..."
                  value={postCaption}
                  onChange={(e) => setPostCaption(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  Publicar Comprovação no Hub (+25 HC)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
