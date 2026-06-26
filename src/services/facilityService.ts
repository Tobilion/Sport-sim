import type { Club } from '../types';

export type FacilityType = 'training' | 'tactics' | 'cardio' | 'medical' | 'accommodation';

export function applyFacilityUpgrade(clubs: Club[], userClubId: string, facilityType: FacilityType): Club[] {
  return clubs.map(c => {
    if (c.id !== userClubId) return c;
    switch (facilityType) {
      case 'training':      return { ...c, trainingFacilities: c.trainingFacilities + 1 };
      case 'tactics':       return { ...c, tacticsFacilities: c.tacticsFacilities + 1 };
      case 'cardio':        return { ...c, cardioFacilities: c.cardioFacilities + 1 };
      case 'medical':       return { ...c, medicalFacilities: (c.medicalFacilities || 1) + 1 };
      case 'accommodation': return { ...c, accommodationFacilities: (c.accommodationFacilities || 1) + 1 };
      default: return c;
    }
  });
}
