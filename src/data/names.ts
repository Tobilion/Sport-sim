import { Club, Player, Coach, PlayerAttributes } from '../types';

export const CLUB_POOLS = [
  { name: 'Crestwood United', color: '#10b981', secondary: '#047857' }, // Theme green
  { name: 'Kingsbury FC', color: '#f59e0b', secondary: '#b45309' },     // Theme amber
  { name: 'Skywards City', color: '#0ea5e9', secondary: '#0369a1' },    // Sky Blue
  { name: 'Meridian Ath', color: '#e11d48', secondary: '#9f1239' },     // Crimson
  { name: 'Blackwood Castle', color: '#4b5563', secondary: '#1f2937' }, // Charcoal
  { name: 'Solaris Wanderers', color: '#84cc16', secondary: '#4d7c0f' },// Lime
  { name: 'Apex Albion', color: '#8b5cf6', secondary: '#5b21b6' },      // Violet
  { name: 'Silvergate Rovers', color: '#9ca3af', secondary: '#374151' },// Silver
  { name: 'Red Star Citadel', color: '#ef4444', secondary: '#991b1b' }, // Bright Red
  { name: 'Northwind Town', color: '#06b6d4', secondary: '#0891b2' },   // Cyan
  { name: 'Ironclad FC', color: '#1e293b', secondary: '#0f172a' },      // Dark Iron
  { name: 'Summit Rangers', color: '#14b8a6', secondary: '#0f766e' },   // Teal
  { name: 'Golden Field', color: '#fbbf24', secondary: '#d97706' },     // Gold
  { name: 'Vanguard Rovers', color: '#ec4899', secondary: '#be185d' },  // Neon Pink
  { name: 'Cobalt Hawks', color: '#2563eb', secondary: '#1e3a8a' },     // Royal Blue
  { name: 'Emerald Coast', color: '#059669', secondary: '#064e3b' },    // Forest
  // Cup Additions (up to 36 Teams in total)
  { name: 'Frostborn Rovers', color: '#a5f3fc', secondary: '#0891b2' },
  { name: 'Canyon Raiders', color: '#ca8a04', secondary: '#713f12' },
  { name: 'Shadow Vale', color: '#111827', secondary: '#030712' },
  { name: 'Apex Dynamo', color: '#a855f7', secondary: '#6b21a8' },
  { name: 'Thunder Bay', color: '#22d3ee', secondary: '#155e75' },
  { name: 'Neon Phoenix', color: '#f43f5e', secondary: '#9f1239' },
  { name: 'Zenith City', color: '#3b82f6', secondary: '#1d4ed8' },
  { name: 'Valiant Athletic', color: '#ea580c', secondary: '#9a3412' },
  { name: 'Prism Warriors', color: '#ec4899', secondary: '#701a75' },
  { name: 'Olympians', color: '#f1f5f9', secondary: '#475569' },
  { name: 'Metropolitan', color: '#312e81', secondary: '#1e1b4b' },
  { name: 'Sovereign FC', color: '#4d7c0f', secondary: '#365314' },
  { name: 'Badger Rovers', color: '#b45309', secondary: '#78350f' },
  { name: 'Siren Harbor', color: '#0f766e', secondary: '#115e59' },
  { name: 'Atlas Athletic', color: '#4338ca', secondary: '#312e81' },
  { name: 'Wyvern United', color: '#be123c', secondary: '#881337' },
  { name: 'Titan Force', color: '#6366f1', secondary: '#3730a3' },
  { name: 'Giga Rovers', color: '#10b981', secondary: '#064e3b' },
  { name: 'Crimson Pride', color: '#991b1b', secondary: '#7f1d1d' },
  { name: 'Oceanic City', color: '#38bdf8', secondary: '#0284c7' }
];

export const FIRST_NAMES = [
  'Marcus', 'Christian', 'Kylian', 'Erling', 'Harry', 'Virgil', 'Luka', 'Mohamed', 'Kevin',
  'Bukayo', 'Declan', 'Jude', 'Robert', 'Antoine', 'Cole', 'Bruno', 'Jack', 'Alistair', 'Theo',
  'Mason', 'Raheem', 'Casemiro', 'Heung-min', 'Federico', 'Enzo', 'Alejandro', 'Lisandro',
  'Gabriel', 'Martin', 'Oleksandr', 'Reece', 'Dominic', 'Conor', 'Harvey', 'Curtis', 'Trent', 'Aaron',
  'Hugo', 'Alisson', 'Ederson', 'Jordan', 'Bernardo', 'Rodri', 'Ruben', 'Matthijs', 'Frenkie', 'Memphis',
  'Phil', 'Darwin', 'Luis', 'Nicolas', 'Alexis', 'Ollie', 'Kai', 'Micky', 'Dejan', 'Yves', 'Rodrigo',
  'Gavi', 'Pedri', 'Lucas', 'Julian', 'Ilkay', 'Manuel', 'Leandro', 'Ivan', 'John', 'Kyle', 'Luke', 'Ben'
];

export const LAST_NAMES = [
  'Rashford', 'Eriksen', 'Mbappe', 'Haaland', 'Kane', 'van Dijk', 'Modric', 'Salah', 'De Bruyne',
  'Saka', 'Rice', 'Bellingham', 'Lewandowski', 'Griezmann', 'Palmer', 'Fernandes', 'Grealish', 'Davies', 'Walcott',
  'Mount', 'Sterling', 'Mendes', 'Son', 'Tonali', 'Chiesa', 'Fernandez', 'Garnacho', 'Martinez',
  'Magalhaes', 'Odegaard', 'Zinchenko', 'James', 'Calvert-Lewin', 'Gallagher', 'Elliott', 'Jones', 'Alexander', 'Ramsdale',
  'Lloris', 'Becker', 'Santana', 'Henderson', 'Silva', 'Hernandez', 'Dias', 'de Ligt', 'de Jong', 'Depay',
  'Foden', 'Nunez', 'Diaz', 'Jackson', 'Mac Allister', 'Watkins', 'Havertz', 'van de Ven', 'Kulusevski', 'Bissouma', 'Bentancur',
  'Gomez', 'Torres', 'Paqueta', 'Alvarez', 'Gundogan', 'Neuer', 'Trossard', 'Toney', 'Stones', 'Walker', 'Shaw', 'White'
];

export const COACH_NAMES: Coach[] = [
  { id: 'c1', name: 'Pep Guardiola', age: 53, specialty: 'Tactics', rating: 95, cost: 9500000 },
  { id: 'c2', name: 'Jurgen Klopp', age: 56, specialty: 'Fitness', rating: 94, cost: 9400000 },
  { id: 'c3', name: 'Carlo Ancelotti', age: 64, specialty: 'Tactics', rating: 93, cost: 9300000 },
  { id: 'c4', name: 'Mikel Arteta', age: 42, specialty: 'Tactics', rating: 90, cost: 9000000 },
  { id: 'c5', name: 'Arne Slot', age: 45, specialty: 'Defending', rating: 88, cost: 8800000 },
  { id: 'c6', name: 'Unai Emery', age: 52, specialty: 'Attacking', rating: 89, cost: 8900000 },
  { id: 'c7', name: 'Ange Postecoglou', age: 58, specialty: 'Attacking', rating: 86, cost: 8600000 },
  { id: 'c8', name: 'Xabi Alonso', age: 42, specialty: 'Tactics', rating: 91, cost: 9100000 },
  { id: 'c9', name: 'Zinedine Zidane', age: 51, specialty: 'Tactics', rating: 92, cost: 9200000 },
  { id: 'c10', name: 'Mauricio Pochettino', age: 52, specialty: 'Youth', rating: 86, cost: 8600000 },
  { id: 'c11', name: 'Enzo Maresca', age: 44, specialty: 'Tactics', rating: 83, cost: 8300000 },
  { id: 'c12', name: 'Roberto De Zerbi', age: 44, specialty: 'Attacking', rating: 87, cost: 8700000 },
  { id: 'c13', name: 'Eddie Howe', age: 46, specialty: 'Youth', rating: 85, cost: 8500000 },
  { id: 'c14', name: 'Thomas Tuchel', age: 50, specialty: 'Defending', rating: 89, cost: 8900000 },
  { id: 'c15', name: 'Simone Inzaghi', age: 48, specialty: 'Defending', rating: 90, cost: 9000000 },
  { id: 'c16', name: 'Antonio Conte', age: 54, specialty: 'Fitness', rating: 90, cost: 9000000 },
  { id: 'c17', name: 'Gian Piero Gasperini', age: 66, specialty: 'Youth', rating: 89, cost: 8900000 },
  { id: 'c18', name: 'Erik ten Hag', age: 54, specialty: 'Youth', rating: 84, cost: 8400000 },
  { id: 'c19', name: 'Ruben Amorim', age: 39, specialty: 'Tactics', rating: 89, cost: 8900000 },
  { id: 'c20', name: 'Luis Enrique', age: 54, specialty: 'Tactics', rating: 89, cost: 8900000 }
];

export const COACH_SPECIALTIES: ('Defending' | 'Attacking' | 'Youth' | 'Tactics' | 'Fitness' | 'Goalkeeping' | 'Set Pieces' | 'Corners' | 'Development')[] = [
  'Defending', 'Attacking', 'Youth', 'Tactics', 'Fitness', 'Goalkeeping', 'Set Pieces', 'Corners', 'Development'
];

export const COACH_NATIONALITIES = [
  'England', 'Spain', 'Germany', 'Italy', 'France', 'Netherlands', 'Portugal', 'Argentina', 'Brazil', 'Belgium'
];

export const randRange = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Global registry of names generated to guarantee ZERO duplicates
const globallyUsedPlayerNames = new Set<string>();

export const generateUniquePlayerName = (): string => {
  let attempts = 0;
  while (attempts < 1000) {
    const fIdx = randRange(0, FIRST_NAMES.length - 1);
    const lIdx = randRange(0, LAST_NAMES.length - 1);
    const candidateName = `${FIRST_NAMES[fIdx]} ${LAST_NAMES[lIdx]}`;
    if (!globallyUsedPlayerNames.has(candidateName)) {
      globallyUsedPlayerNames.add(candidateName);
      return candidateName;
    }
    attempts++;
  }
  // Fallback if somehow saturated (impossible in normal runs)
  const fallback = `Gen-${randRange(100, 999)} Player-${randRange(1000, 9999)}`;
  return fallback;
};

// Generates position-specific realistic attributes scaled to player OVR rating
export const generatePlayerAttributes = (pos: 'GK' | 'DEF' | 'MID' | 'ATT', rating: number): PlayerAttributes => {
  const baseAttr = (r: number, minOffset: number, maxOffset: number) => {
    return Math.min(99, Math.max(30, r + randRange(minOffset, maxOffset)));
  };

  switch (pos) {
    case 'GK':
      return {
        pace: baseAttr(rating, -25, -10),
        shooting: baseAttr(rating, -45, -30),
        passing: baseAttr(rating, -15, 0),
        dribbling: baseAttr(rating, -25, -10),
        defending: baseAttr(rating, 2, 8), // High goalkeeper saves/diving
        physical: baseAttr(rating, -5, 5),
      };
    case 'DEF':
      return {
        pace: baseAttr(rating, -10, 5),
        shooting: baseAttr(rating, -35, -15),
        passing: baseAttr(rating, -15, -2),
        dribbling: baseAttr(rating, -20, -5),
        defending: baseAttr(rating, 4, 10), // Solid defensive metrics
        physical: baseAttr(rating, 2, 9),
      };
    case 'MID':
      return {
        pace: baseAttr(rating, -8, 8),
        shooting: baseAttr(rating, -15, 5),
        passing: baseAttr(rating, 4, 11), // World-class playmaker mechanics
        dribbling: baseAttr(rating, 2, 10),
        defending: baseAttr(rating, -10, 5),
        physical: baseAttr(rating, -10, 5),
      };
    case 'ATT':
      return {
        pace: baseAttr(rating, 5, 14), // Blazing strikers
        shooting: baseAttr(rating, 4, 12), // Clinical conversions
        passing: baseAttr(rating, -10, 2),
        dribbling: baseAttr(rating, 3, 10),
        defending: baseAttr(rating, -45, -25),
        physical: baseAttr(rating, -8, 6),
      };
  }
};

// Generates exactly 15 players for a club (11 Starters + 4 Subs)
export const generateSquadForClub = (clubId: string, ratingFloor: number): Player[] => {
  const squad: Player[] = [];
  const positions: ('GK' | 'DEF' | 'MID' | 'ATT')[] = [
    'GK',                             // 1 GK (Starts)
    'DEF', 'DEF', 'DEF', 'DEF',       // 4 DEF (Starts)
    'MID', 'MID', 'MID', 'MID',       // 4 MID (Starts)
    'ATT', 'ATT',                     // 2 ATT (Starts) -> Total 11 starters
    'GK', 'DEF', 'MID', 'ATT'         // 4 Subs (Bench)
  ];

  positions.forEach((pos, idx) => {
    const pName = generateUniquePlayerName();
    const ratingOffset = randRange(-5, 6);
    const rating = Math.min(96, Math.max(62, ratingFloor + ratingOffset));
    const stamina = randRange(85, 100);
    const morale = randRange(80, 100);

    const valuationFactor = Math.pow(rating - 55, 3.0) * 9000;
    const marketValue = Math.round(valuationFactor / 50000) * 50000 + randRange(0, 4) * 10000;

    // First 11 index elements represent starters, remaining 4 are bench warmers
    const isStarting = idx < 11;
    const age = randRange(18, 34);
    const potentialRating = rating + Math.max(0, 30 - age) + randRange(0, 5);

    squad.push({
      id: `${clubId}-player-${idx}`,
      name: pName,
      position: pos,
      age,
      rating,
      potentialRating: Math.min(99, potentialRating),
      isYouth: false,
      stamina,
      morale,
      goals: 0,
      assists: 0,
      saves: 0,
      yellowCards: 0,
      redCards: 0,
      matchRatings: [],
      marketValue: marketValue > 80000 ? marketValue : randRange(150, 300) * 1000,
      attributes: generatePlayerAttributes(pos, rating),
      isStarting,
      fatigue: 100,
      appearances: 0,
    });
  });

  return squad;
};

export const MENTALITIES: ('Tiki-Taka' | 'Gegenpressing' | 'Park the Bus' | 'Counter-Attack')[] = [
  'Gegenpressing', 'Tiki-Taka', 'Counter-Attack', 'Park the Bus'
];

// Generates a fully-customized unique head coach
export const generateUniqueCoach = (idx: number): Coach => {
  // If we match known names
  if (idx < COACH_NAMES.length) {
    return COACH_NAMES[idx];
  }
  
  // Dynamic generation
  const coachFirstName = FIRST_NAMES[randRange(0, FIRST_NAMES.length - 1)];
  const coachLastName = LAST_NAMES[randRange(0, LAST_NAMES.length - 1)];
  const rating = randRange(72, 89);
  return {
    id: `coach-${idx}-${Date.now()}`,
    name: `Manager ${coachFirstName} ${coachLastName}`,
    age: randRange(38, 65),
    specialty: COACH_SPECIALTIES[randRange(0, COACH_SPECIALTIES.length - 1)],
    preferredMentality: MENTALITIES[randRange(0, MENTALITIES.length - 1)],
    rating,
    cost: rating * 1000 * randRange(8, 12)
  };
};

export const seedAllClubs = (): Club[] => {
  // We guarantee all 36 teams inside CLUB_POOLS are seeded
  return CLUB_POOLS.map((clubPool, idx) => {
    const id = `club-${idx + 1}`;
    
    // Tiered club qualities
    let baseStrength = 75;
    if (idx < 4) baseStrength = 86;       // 4 Title Titans (e.g. Crestwood, Kingsbury, Skywards, Meridian)
    else if (idx < 10) baseStrength = 80;  // Champions league contenders
    else if (idx < 20) baseStrength = 74;  // Normal league roster
    else baseStrength = randRange(66, 72); // Cup low-tier challenges / potential underdogs

    const squad = generateSquadForClub(id, baseStrength);
    const youthSquad: Player[] = [];
    for (let i = 0; i < 8; i++) {
      youthSquad.push(generateWonderkid(`${id}-youth-${i}`, true));
    }

    const mentalities: ('Tiki-Taka' | 'Gegenpressing' | 'Park the Bus' | 'Counter-Attack')[] = [
      'Gegenpressing', 'Tiki-Taka', 'Counter-Attack', 'Park the Bus'
    ];

    const initialCoach = generateUniqueCoach(idx);

    return {
      id,
      name: clubPool.name,
      color: clubPool.color,
      secondaryColor: clubPool.secondary,
      squad,
      youthSquad,
      coach: initialCoach,
      coaches: [initialCoach],
      mentality: mentalities[idx % mentalities.length],
      trainingFacilities: 1,
      tacticsFacilities: 1,
      cardioFacilities: 1,
      medicalFacilities: 1,
      points: 0,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      streak: []
    };
  });
};

export const generateWonderkid = (id: string, isYouth = false): Player => {
  const positions: ('GK' | 'DEF' | 'MID' | 'ATT')[] = ['GK', 'DEF', 'MID', 'ATT'];
  const pos = positions[randRange(0, 3)];
  const pName = generateUniquePlayerName();
  const rating = randRange(55, 68); // Wonderkids are lower rated but we can boost them via training
  const potentialRating = rating + randRange(15, 30);
  const stamina = randRange(75, 95);
  const morale = 100;
  const age = randRange(16, 18);

  return {
    id,
    name: pName,
    position: pos,
    age,
    rating,
    potentialRating,
    isYouth,
    stamina,
    morale,
    goals: 0,
    assists: 0,
    saves: 0,
    yellowCards: 0,
    redCards: 0,
    matchRatings: [],
    marketValue: randRange(2, 6) * 500000, // cheaper initially
    attributes: generatePlayerAttributes(pos, rating),
    isStarting: false,
    fatigue: 100,
    appearances: 0,
  };
};
