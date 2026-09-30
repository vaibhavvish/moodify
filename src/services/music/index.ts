/**
 * Music Service Facade
 * All UI components should import from here instead of directly from the provider.
 * When switching providers, only this file needs to change.
 */
import type { MusicProvider } from '../../types';
import { mockMusicProvider } from './mockProvider';
import { deezerProvider } from './deezerProvider';
import { itunesProvider } from './itunesProvider';
import { saavnProvider } from './saavnProvider';

// Active provider — swap this in Phase 2
let activeProvider: MusicProvider = itunesProvider;

export function getMusicProvider(): MusicProvider {
  return activeProvider;
}

export function setMusicProvider(provider: MusicProvider): void {
  activeProvider = provider;
}

// Re-export for convenience
export { mockMusicProvider, deezerProvider, itunesProvider, saavnProvider };
