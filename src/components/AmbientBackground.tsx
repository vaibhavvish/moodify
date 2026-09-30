import { useMood } from '../store/moodStore';
import { useVibeFlow } from '../store/vibeFlowStore';
import { moodThemes } from '../themes/moodTheme';
import { cn } from '../utils';

export default function AmbientBackground() {
  const { state: moodState } = useMood();
  const { state: vibeFlowState } = useVibeFlow();
  
  // VibeFlow mood takes precedence if active, otherwise use global mood
  const activeMood = vibeFlowState.isActive && vibeFlowState.currentMoodResult
    ? vibeFlowState.currentMoodResult.mood
    : moodState.currentMood;

  const theme = activeMood ? moodThemes[activeMood] : null;

  return (
    <div className="ambient-bg" aria-hidden="true">
      <div
        className="ambient-orb ambient-orb-1"
        style={
          theme
            ? {
                background: `radial-gradient(circle, ${theme.orbColors[0]}, transparent)`,
                animationDuration: theme.animationSpeed === 'slow' ? '30s' : theme.animationSpeed === 'fast' ? '12s' : '20s',
                transition: 'background 1.5s ease, animation-duration 1s ease',
              }
            : undefined
        }
      />
      <div
        className="ambient-orb ambient-orb-2"
        style={
          theme
            ? {
                background: `radial-gradient(circle, ${theme.orbColors[1]}, transparent)`,
                animationDuration: theme.animationSpeed === 'slow' ? '28s' : theme.animationSpeed === 'fast' ? '14s' : '20s',
                transition: 'background 1.5s ease, animation-duration 1s ease',
              }
            : undefined
        }
      />
      <div
        className="ambient-orb ambient-orb-3"
        style={
          theme
            ? {
                background: `radial-gradient(circle, ${theme.orbColors[2]}, transparent)`,
                animationDuration: theme.animationSpeed === 'slow' ? '26s' : theme.animationSpeed === 'fast' ? '10s' : '20s',
                transition: 'background 1.5s ease, animation-duration 1s ease',
              }
            : undefined
        }
      />
      {/* Mood intensity overlay */}
      {theme && (
        <div
          className={cn(
            'absolute inset-0 transition-opacity duration-1000',
            theme.intensity === 'high' ? 'opacity-15' : theme.intensity === 'medium' ? 'opacity-10' : 'opacity-5'
          )}
          style={{
            background: `radial-gradient(ellipse at center, ${theme.glowColor}, transparent 70%)`,
          }}
        />
      )}
    </div>
  );
}
