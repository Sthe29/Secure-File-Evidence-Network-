import { PoliceStation } from '../types/complainant';

export type { PoliceStation };

export const POLICE_STATIONS: PoliceStation[] = [
  {
    id: 'sta_sandton',
    name: 'SAPS Sandton (Central Precinct)',
    precinctCode: 'GP-JHB-04',
    address: 'Summit Road & Rivonia Road',
    suburb: 'Morningside / Sandton',
    city: 'Johannesburg',
    province: 'Gauteng',
    postalCode: '2196',
    phone: '011 722 4200',
    emergencyPhone: '082 300 8377 (Sector 1 Patrol)',
    stationCommander: 'Brigadier N. Sithole',
    operatingHours: '24 Hours / 7 Days a Week (CSC)',
    latitude: -26.0827,
    longitude: 28.0583,
    services: [
      'Community Service Centre (CSC) 24/7',
      'Detective Branch & Docket Registration',
      'Victim Friendly Room (VFR)',
      'Commissioner of Oaths & Certifications',
      'Sector Policing Rapid Dispatch'
    ]
  },
  {
    id: 'sta_rosebank',
    name: 'SAPS Rosebank',
    precinctCode: 'GP-JHB-07',
    address: '15 Sturdee Avenue',
    suburb: 'Rosebank',
    city: 'Johannesburg',
    province: 'Gauteng',
    postalCode: '2196',
    phone: '011 778 4700',
    emergencyPhone: '071 675 6001 (Sector 2 Patrol)',
    stationCommander: 'Colonel M. Khumalo',
    operatingHours: '24 Hours / 7 Days a Week (CSC)',
    latitude: -26.1462,
    longitude: 28.0385,
    services: [
      'Community Service Centre (CSC) 24/7',
      'Criminal Investigation Division',
      'Victim Support Unit',
      'Affidavits & Document Certification'
    ]
  },
  {
    id: 'sta_bramley',
    name: 'SAPS Bramley',
    precinctCode: 'GP-JHB-09',
    address: 'Cnr Corlett Drive & Eden Road',
    suburb: 'Bramley',
    city: 'Johannesburg',
    province: 'Gauteng',
    postalCode: '2090',
    phone: '011 445 4100',
    emergencyPhone: '082 411 0188',
    stationCommander: 'Colonel S. Pillay',
    operatingHours: '24 Hours / 7 Days a Week (CSC)',
    latitude: -26.1289,
    longitude: 28.0821,
    services: [
      'Community Service Centre (CSC) 24/7',
      'General Detective Division',
      'Community Police Forum (CPF) Liaison',
      'Lost Property & Firearms Licensing'
    ]
  },
  {
    id: 'sta_jhb_central',
    name: 'SAPS Johannesburg Central',
    precinctCode: 'GP-JHB-01',
    address: '1 Commissioner Street',
    suburb: 'Ferreirasdorp / CBD',
    city: 'Johannesburg',
    province: 'Gauteng',
    postalCode: '2001',
    phone: '011 497 7000',
    emergencyPhone: '10111 / 082 371 9024',
    stationCommander: 'Major General P. Ndlovu',
    operatingHours: '24 Hours / 7 Days a Week (CSC)',
    latitude: -26.2054,
    longitude: 28.0345,
    services: [
      'Metropolitan Police Headquarters',
      '24/7 Community Service Centre',
      'Specialised Commercial Crime Unit',
      'Family Violence, Child Protection & Sexual Offences (FCS)',
      'Forensic Evidence Holding'
    ]
  },
  {
    id: 'sta_parkview',
    name: 'SAPS Parkview',
    precinctCode: 'GP-JHB-03',
    address: '71 Dundalk Avenue',
    suburb: 'Parkview / Greenside',
    city: 'Johannesburg',
    province: 'Gauteng',
    postalCode: '2193',
    phone: '011 067 6000',
    emergencyPhone: '071 675 6060',
    stationCommander: 'Colonel T. Govender',
    operatingHours: '24 Hours / 7 Days a Week (CSC)',
    latitude: -26.1661,
    longitude: 28.0264,
    services: [
      'Community Service Centre (CSC) 24/7',
      'Residential Area Patrols',
      'Victim Support Desk'
    ]
  },
  {
    id: 'sta_midrand',
    name: 'SAPS Midrand',
    precinctCode: 'GP-JHB-12',
    address: 'Old Pretoria Main Road & Halfway House',
    suburb: 'Halfway House',
    city: 'Midrand',
    province: 'Gauteng',
    postalCode: '1685',
    phone: '011 347 1600',
    emergencyPhone: '082 778 0039',
    stationCommander: 'Brigadier D. Moonsamy',
    operatingHours: '24 Hours / 7 Days a Week (CSC)',
    latitude: -25.9984,
    longitude: 28.1278,
    services: [
      'Community Service Centre 24/7',
      'Industrial & Corporate Crime Desk',
      'Highway Patrol Liaison'
    ]
  },
  {
    id: 'sta_pta_central',
    name: 'SAPS Pretoria Central',
    precinctCode: 'GP-TSH-01',
    address: '315 Pretorius Street',
    suburb: 'Pretoria Central',
    city: 'Tshwane / Pretoria',
    province: 'Gauteng',
    postalCode: '0002',
    phone: '012 353 4000',
    emergencyPhone: '10111',
    stationCommander: 'Brigadier B. Mthembu',
    operatingHours: '24 Hours / 7 Days a Week (CSC)',
    latitude: -25.7461,
    longitude: 28.1881,
    services: [
      'Capital Precinct CSC 24/7',
      'Serious Violent Crime Unit',
      'Court Liaison Division'
    ]
  },
  {
    id: 'sta_brooklyn',
    name: 'SAPS Brooklyn',
    precinctCode: 'GP-TSH-04',
    address: 'Cnr Duxbury & Brooks Streets',
    suburb: 'Brooklyn',
    city: 'Tshwane / Pretoria',
    province: 'Gauteng',
    postalCode: '0181',
    phone: '012 366 1700',
    emergencyPhone: '082 334 7762',
    stationCommander: 'Colonel L. Van der Merwe',
    operatingHours: '24 Hours / 7 Days a Week (CSC)',
    latitude: -25.7588,
    longitude: 28.2415,
    services: [
      'Community Service Centre 24/7',
      'Campus Policing Liaison',
      'Diplomatic Security Coordination'
    ]
  },
  {
    id: 'sta_soweto_orlando',
    name: 'SAPS Orlando (Soweto)',
    precinctCode: 'GP-SWT-01',
    address: 'Klipspruit Valley Road',
    suburb: 'Orlando East',
    city: 'Soweto',
    province: 'Gauteng',
    postalCode: '1804',
    phone: '011 935 9945',
    emergencyPhone: '082 822 8133',
    stationCommander: 'Brigadier P. Baloyi',
    operatingHours: '24 Hours / 7 Days a Week (CSC)',
    latitude: -26.2412,
    longitude: 27.9189,
    services: [
      'Community Service Centre 24/7',
      'Youth & Community Desk',
      'Domestic Violence Care Support'
    ]
  },
  {
    id: 'sta_cpt_central',
    name: 'SAPS Cape Town Central',
    precinctCode: 'WC-CPT-01',
    address: 'Buitenkant Street',
    suburb: 'Cape Town City Centre',
    city: 'Cape Town',
    province: 'Western Cape',
    postalCode: '8001',
    phone: '021 467 8000',
    emergencyPhone: '10111 / 082 411 2403',
    stationCommander: 'Brigadier Z. Hansraj',
    operatingHours: '24 Hours / 7 Days a Week (CSC)',
    latitude: -33.9304,
    longitude: 18.4239,
    services: [
      'Community Service Centre 24/7',
      'Tourism Safety Unit',
      'Harbour & CBD Incident Desk'
    ]
  },
  {
    id: 'sta_sea_point',
    name: 'SAPS Sea Point',
    precinctCode: 'WC-CPT-03',
    address: 'Main Road & Tramway Road',
    suburb: 'Sea Point',
    city: 'Cape Town',
    province: 'Western Cape',
    postalCode: '8005',
    phone: '021 430 3700',
    emergencyPhone: '082 302 5436',
    stationCommander: 'Colonel C. De Villiers',
    operatingHours: '24 Hours / 7 Days a Week (CSC)',
    latitude: -33.9168,
    longitude: 18.3905,
    services: [
      'Community Service Centre 24/7',
      'Atlantic Seaboard Rapid Patrol',
      'Victim Support Centre'
    ]
  },
  {
    id: 'sta_dbn_central',
    name: 'SAPS Durban Central',
    precinctCode: 'KZN-ETH-01',
    address: 'Stalwart Simelane Street',
    suburb: 'Durban Central',
    city: 'Durban',
    province: 'KwaZulu-Natal',
    postalCode: '4001',
    phone: '031 325 4000',
    emergencyPhone: '10111 / 082 411 6571',
    stationCommander: 'Major General S. Mkhize',
    operatingHours: '24 Hours / 7 Days a Week (CSC)',
    latitude: -29.8587,
    longitude: 31.0218,
    services: [
      'Community Service Centre 24/7',
      'Port & Coastal Security Liaison',
      'Specialised Commercial Crime'
    ]
  }
];

/**
 * Calculates Great-Circle distance between two coordinates in kilometers (Haversine formula).
 */
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export interface NearestStationResult {
  station: PoliceStation;
  distanceKm: number;
  estimatedDriveTimeMinutes: number;
}

/**
 * Finds the closest police station given latitude and longitude.
 */
export function findNearestPoliceStation(lat: number, lon: number): NearestStationResult {
  let nearest: PoliceStation = POLICE_STATIONS[0];
  let minDistance = calculateDistanceKm(lat, lon, nearest.latitude, nearest.longitude);

  for (let i = 1; i < POLICE_STATIONS.length; i++) {
    const d = calculateDistanceKm(lat, lon, POLICE_STATIONS[i].latitude, POLICE_STATIONS[i].longitude);
    if (d < minDistance) {
      minDistance = d;
      nearest = POLICE_STATIONS[i];
    }
  }

  // Rough estimation: average urban drive speed ~35 km/h + 3 min buffer
  const driveMinutes = Math.max(2, Math.round((minDistance / 35) * 60) + 2);

  return {
    station: nearest,
    distanceKm: minDistance,
    estimatedDriveTimeMinutes: driveMinutes
  };
}

/**
 * Gets ranked police stations closest to a coordinate.
 */
export function getNearbyStations(lat: number, lon: number, limit = 5): NearestStationResult[] {
  const list = POLICE_STATIONS.map((station) => {
    const dist = calculateDistanceKm(lat, lon, station.latitude, station.longitude);
    const driveMinutes = Math.max(2, Math.round((dist / 35) * 60) + 2);
    return {
      station,
      distanceKm: dist,
      estimatedDriveTimeMinutes: driveMinutes
    };
  });

  list.sort((a, b) => a.distanceKm - b.distanceKm);
  return list.slice(0, limit);
}

/**
 * Resolves a station by name or preferred string.
 */
export function getPoliceStationByName(name: string): PoliceStation | undefined {
  if (!name) return undefined;
  const lower = name.toLowerCase();
  
  return POLICE_STATIONS.find((s) => {
    const sName = s.name.toLowerCase();
    const sSuburb = s.suburb.toLowerCase();
    return sName.includes(lower) || lower.includes(sName) || lower.includes(sSuburb) || sSuburb.includes(lower);
  }) || POLICE_STATIONS[0];
}

/**
 * Returns default coordinates based on province and city.
 */
export function getDefaultCoordsForLocation(city: string, province: string): { lat: number; lng: number } {
  const c = (city || '').toLowerCase();
  const p = (province || '').toLowerCase();

  if (c.includes('cape town') || p.includes('western cape')) {
    return { lat: -33.9249, lng: 18.4241 };
  }
  if (c.includes('durban') || p.includes('kwazulu')) {
    return { lat: -29.8587, lng: 31.0218 };
  }
  if (c.includes('pretoria') || c.includes('tshwane')) {
    return { lat: -25.7461, lng: 28.1881 };
  }
  if (c.includes('midrand')) {
    return { lat: -25.9984, lng: 28.1278 };
  }
  if (c.includes('soweto')) {
    return { lat: -26.2412, lng: 27.9189 };
  }
  // Default to Johannesburg / Sandton
  return { lat: -26.0827, lng: 28.0583 };
}
