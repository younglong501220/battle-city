// Sound Manager Stub (Audio disabled per user request)

export type AudioState = 'uninitialized' | 'suspended' | 'running' | 'interrupted' | 'error';
export type AudioListener = (state: AudioState, isMuted: boolean, lastError: string | null) => void;

class SoundManager {
  public subscribe(_listener: AudioListener): () => void {
    return () => {};
  }

  public getState(): AudioState {
    return 'uninitialized';
  }

  public getLastError(): string | null {
    return null;
  }

  public unlockAudio(): boolean {
    return false;
  }

  public unlockAndPlayIntro(): boolean {
    return false;
  }

  public init(): boolean {
    return false;
  }

  public setMuted(_muted: boolean) {}

  public isMuted(): boolean {
    return true;
  }

  public toggleMute(): boolean {
    return true;
  }

  public setVolume(_val: number) {}

  public playShoot() {}
  public playExplosion(_isBig = false) {}
  public playSteelHit() {}
  public playBrickHit() {}
  public playBaseDestroyed() {}
  public playStartJingle() {}
  public playGameOverJingle() {}
  public playVictoryJingle() {}
  public playTestBeep() {}
}

export const sound = new SoundManager();
