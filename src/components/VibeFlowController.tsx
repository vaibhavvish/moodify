import { useEffect } from 'react';
import { usePlayer } from '../store/playerStore';
import { useVibeFlow } from '../store/vibeFlowStore';

export default function VibeFlowController() {
  const { state: playerState, addToQueue } = usePlayer();
  const { state: vibeFlowState, generateMoreTracks } = useVibeFlow();

  // Queue replenishment
  useEffect(() => {
    if (vibeFlowState.isActive && !vibeFlowState.isGenerating && playerState.queue.length > 0) {
      const remaining = playerState.queue.length - playerState.queueIndex;
      if (remaining <= 3) {
        // time to replenish
        const exclude = playerState.queue.map(s => s.id);
        generateMoreTracks(exclude, 6).then((newTracks) => {
           if (newTracks.length > 0) {
             // Add them to player queue
             newTracks.forEach(t => addToQueue(t));
           }
        });
      }
    }
  }, [
    playerState.queueIndex, 
    playerState.queue.length, 
    vibeFlowState.isActive, 
    vibeFlowState.isGenerating, 
    generateMoreTracks, 
    addToQueue
  ]);

  return null;
}
