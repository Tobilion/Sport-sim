export interface NotificationItem {
  id: string;
  type: 'transfer' | 'morale' | 'injury' | 'scout' | 'match' | 'board' | 'general';
  title: string;
  body: string;
  timestamp: number;
  read: boolean;
}

export interface MoraleEventOption {
  label: string;
  moraleEffect: number;
  cost?: number;
}

export interface MoraleEvent {
  playerId: string;
  playerName: string;
  currentMorale: number;
  reason: string;
  options: MoraleEventOption[];
}

export interface NewsItem {
  id: string;
  week: number;
  headline: string;
  type: 'match' | 'transfer' | 'injury' | 'general';
}
