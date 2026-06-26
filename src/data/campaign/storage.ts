import type { CampaignState, Club } from '../../types';

const CAMPAIGN_KEY = 'sport_sim_pro_campaign';
const CLUBS_KEY = 'sport_sim_pro_clubs';

export function loadCampaignFromStorage(): { campaign: CampaignState; clubs: Club[] } | null {
  try {
    const campaignData = localStorage.getItem(CAMPAIGN_KEY);
    const clubsData = localStorage.getItem(CLUBS_KEY);
    if (campaignData && clubsData) {
      return { campaign: JSON.parse(campaignData), clubs: JSON.parse(clubsData) };
    }
  } catch (err) {
    console.error('Failed to load campaign from localStorage', err);
  }
  return null;
}

export function saveCampaignToStorage(campaign: CampaignState, clubs: Club[]): void {
  try {
    localStorage.setItem(CAMPAIGN_KEY, JSON.stringify(campaign));
    localStorage.setItem(CLUBS_KEY, JSON.stringify(clubs));
  } catch (err) {
    console.error('Failed to save campaign to localStorage', err);
  }
}
