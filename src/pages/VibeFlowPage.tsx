import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, Plus, Heart, SkipForward, Flame, Leaf, Wand2, X } from 'lucide-react';
import { Button, Input, Modal, PageLoader, EmptyState } from '../components/ui';
import { usePlayer } from '../store/playerStore';
import { useVibeFlow } from '../store/vibeFlowStore';
import { useLibrary } from '../store/libraryStore';
import { useAuth } from '../store/authStore';
import { moodConfigs } from '../data/moods';
import { cn, formatTime } from '../utils';

export default function VibeFlowPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { state: playerState, playSong, next, addToQueue, setTime, setQueue } = usePlayer();
  const { state: vibeFlowState, startVibeFlow, generateMoreTracks, recordSkip, recordPlay, updateVibe, stopVibeFlow } = useVibeFlow();
  const { toggleLike, isLiked } = useLibrary();
  const { requireAuth } = useAuth();
  
  const [newVibeInput, setNewVibeInput] = useState('');
  const [isChangingVibe, setIsChangingVibe] = useState(false);

  // Initialize VibeFlow if starting with query param
  useEffect(() => {
    const q = searchParams.get('q');
    if (q && !vibeFlowState.isActive) {
      const init = async () => {
        await startVibeFlow(q);
        const tracks = await generateMoreTracks([], 8);
        if (tracks.length > 0) {
          playSong(tracks[0], tracks);
        }
      };
      init();
    }
  }, [searchParams, vibeFlowState.isActive, startVibeFlow, generateMoreTracks, playSong]);

  // Handle skips
  const handleSkip = () => {
    if (playerState.currentSong) {
      recordSkip(playerState.currentSong.id);
    }
    next();
  };

  // Handle Like
  const handleLike = () => {
    if (playerState.currentSong) {
      requireAuth(() => toggleLike(playerState.currentSong!));
    }
  };

  // Change Vibe
  const handleChangeVibe = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newVibeInput.trim()) return;
    updateVibe(newVibeInput);
    setIsChangingVibe(false);
    setNewVibeInput('');
    
    // Clear future queue and immediately generate new tracks based on the new vibe
    const exclude = [playerState.currentSong?.id].filter(Boolean) as string[];
    const newTracks = await generateMoreTracks(exclude, 6);
    if (newTracks.length > 0) {
       const newQueue = [...playerState.queue.slice(0, playerState.queueIndex + 1), ...newTracks];
       setQueue(newQueue);
    }
  };

  const handleModifier = async (modifier: string) => {
    if (vibeFlowState.currentMoodResult) {
      const currentQuery = vibeFlowState.currentMoodResult.inputText;
      const newVibe = `${currentQuery} but ${modifier}`;
      updateVibe(newVibe);
      
      const exclude = [playerState.currentSong?.id].filter(Boolean) as string[];
      const newTracks = await generateMoreTracks(exclude, 6);
      if (newTracks.length > 0) {
         const newQueue = [...playerState.queue.slice(0, playerState.queueIndex + 1), ...newTracks];
         setQueue(newQueue);
      }
    }
  };

  if (!vibeFlowState.isActive) {
    return (
      <EmptyState
        className="min-h-[70vh]"
        icon={<Brain size={48} className="text-[var(--color-accent)]" />}
        title="Start your VibeFlow"
        description="Tell MoodSense what you're feeling, and we'll create an endless, evolving stream of music tailored perfectly to your vibe."
        action={
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (newVibeInput.trim()) {
                navigate(`/vibe-flow?q=${encodeURIComponent(newVibeInput)}`);
              }
            }}
            className="w-full max-w-lg flex flex-col sm:flex-row gap-3 mt-4"
          >
            <Input 
              placeholder="e.g. late night driving with rain" 
              className="flex-1"
              value={newVibeInput}
              onChange={(e) => setNewVibeInput(e.target.value)}
            />
            <Button type="submit" size="lg" className="whitespace-nowrap gap-2">
              <Sparkles size={18} />
              Start Flow
            </Button>
          </form>
        }
      />
    );
  }

  const { currentMoodResult } = vibeFlowState;
  const currentSong = playerState.currentSong;
  const moodConfig = currentMoodResult ? moodConfigs[currentMoodResult.mood] : null;

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-fade-in relative">
      {/* VibeFlow Header */}
      <motion.div 
        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-4">
            <Brain size={14} className={cn("text-purple-400")} />
            <span className="text-xs font-semibold tracking-wider uppercase text-[var(--color-text-muted)]">VibeFlow Active</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold font-[var(--font-display)]">
            {currentMoodResult?.vibe[0] || 'VibeFlow'}
          </h1>
          <p className="text-[var(--color-text-muted)] mt-2 flex items-center gap-2">
            Let the vibe keep flowing.
          </p>
        </div>

        {/* Current Vibe Tags */}
        <div className="flex flex-wrap gap-2 md:justify-end">
          {currentMoodResult?.vibe.map((v, i) => (
            <span key={i} className={cn("px-4 py-2 rounded-xl text-sm font-medium border", moodConfig?.bgClass || 'bg-white/5', 'border-white/10')}>
              {v}
            </span>
          ))}
          <Button variant="outline" size="sm" className="rounded-xl border-white/10" onClick={() => setIsChangingVibe(true)}>
            Change Vibe
          </Button>
        </div>
      </motion.div>

      {/* Main Content Layout */}
      <div className="grid lg:grid-cols-[1fr_400px] gap-8">
        
        {/* Large Player Section */}
        <motion.div 
          className="relative rounded-3xl overflow-hidden bg-black/40 border border-white/5 p-8 flex flex-col justify-center min-h-[500px]"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {moodConfig && (
            <div className={cn('absolute inset-0 opacity-10 bg-gradient-to-br mix-blend-overlay', moodConfig.gradient)} />
          )}
          
          {currentSong ? (
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentSong.id}
                initial={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 1.02, filter: 'blur(4px)' }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12 text-center md:text-left"
              >
                <div className="w-56 h-56 md:w-80 md:h-80 shrink-0 rounded-2xl overflow-hidden shadow-2xl shadow-black/80 relative group">
                  <img src={currentSong.coverUrl} alt={currentSong.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                     <Button size="icon" variant="ghost" onClick={handleSkip} className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 text-white transform hover:scale-110 transition-transform">
                       <SkipForward size={32} />
                     </Button>
                  </div>
                </div>
                
                <div className="flex-1 min-w-0 flex flex-col items-center md:items-start">
                  <h2 className="text-3xl md:text-5xl font-extrabold font-[var(--font-display)] mb-4 leading-tight">{currentSong.title}</h2>
                  <p className="text-xl text-[var(--color-text-muted)] mb-8">{currentSong.artist}</p>
                  
                  {/* VibeFlow Controls for Current Song */}
                  <div className="flex items-center gap-4">
                    <Button 
                      size="lg" 
                      variant="secondary" 
                      className={cn("gap-2 w-14 h-14 rounded-full p-0 flex items-center justify-center", isLiked(currentSong.id) && "text-pink-500 bg-pink-500/10")} 
                      onClick={handleLike}
                    >
                      <Heart size={24} fill={isLiked(currentSong.id) ? "currentColor" : "none"} />
                    </Button>
                    <Button size="lg" className="rounded-full px-8 gap-2 hover:scale-105 transition-transform" onClick={handleSkip}>
                      <SkipForward size={20} />
                      Skip
                    </Button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center relative z-10">
              <PageLoader />
              <p className="text-[var(--color-text-muted)] mt-4">Generating your vibe...</p>
            </div>
          )}
        </motion.div>

        {/* Up Next & Modifiers Sidebar */}
        <div className="space-y-6">
          <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-3xl p-6">
            <h3 className="text-lg font-bold mb-4 font-[var(--font-display)] flex items-center gap-2">
              <Wand2 size={18} className="text-[var(--color-accent)]" />
              Tweak the Flow
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" size="sm" className="justify-start gap-2" onClick={() => handleModifier('More Energy')}>
                <Flame size={14} className="text-orange-400" /> More Energy
              </Button>
              <Button variant="secondary" size="sm" className="justify-start gap-2" onClick={() => handleModifier('More Chill')}>
                <Leaf size={14} className="text-green-400" /> More Chill
              </Button>
              <Button variant="secondary" size="sm" className="justify-start gap-2 col-span-2" onClick={() => handleModifier('Surprise me')}>
                <Sparkles size={14} className="text-purple-400" /> Surprise Me
              </Button>
            </div>
          </div>

          <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold font-[var(--font-display)]">Up Next</h3>
              {vibeFlowState.isGenerating && (
                <span className="text-xs text-[var(--color-accent)] animate-pulse flex items-center gap-1">
                  <Sparkles size={12} /> Finding tracks...
                </span>
              )}
            </div>
            <div className="space-y-3">
              {playerState.queue.slice(playerState.queueIndex + 1, playerState.queueIndex + 6).map((song, idx) => (
                <div key={song.id + idx} className="flex items-center gap-3 group">
                  <img src={song.coverUrl} className="w-10 h-10 rounded-lg object-cover" alt="" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{song.title}</p>
                    <p className="text-xs text-[var(--color-text-muted)] truncate">{song.artist}</p>
                  </div>
                </div>
              ))}
              {playerState.queue.length - playerState.queueIndex <= 1 && !vibeFlowState.isGenerating && (
                 <p className="text-sm text-[var(--color-text-muted)] italic text-center py-4">
                   VibeFlow is generating more tracks...
                 </p>
              )}
            </div>
          </div>
          
          <Button variant="ghost" fullWidth className="text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={stopVibeFlow}>
            Stop VibeFlow
          </Button>
        </div>
      </div>

      {/* Change Vibe Modal */}
      <Modal isOpen={isChangingVibe} onClose={() => setIsChangingVibe(false)} title="Change the Vibe">
        <form onSubmit={handleChangeVibe} className="space-y-4 mt-2">
          <Input 
            placeholder="What's the new vibe?"
            value={newVibeInput}
            onChange={(e) => setNewVibeInput(e.target.value)}
            autoFocus
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={() => setIsChangingVibe(false)}>Cancel</Button>
            <Button type="submit" disabled={!newVibeInput.trim()}>Update Flow</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
