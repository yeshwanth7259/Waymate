import { Ride, User, TechCorridor, KarnatakaCity, Booking } from '../types';

export const CURRENT_USER: User = {
  id: 'usr-101',
  name: 'Aravind Swaminathan',
  phone: '+91 98450 12890',
  email: 'aravind.s@gmail.com',
  workEmail: 'aravind.s@infosys.com',
  company: 'Infosys Limited (Electronic City Phase 1)',
  rating: 4.9,
  totalRides: 42,
  isPhoneVerified: true,
  isWorkVerified: true,
  isGovtIdVerified: true,
  isDrivingLicenseVerified: true,
  gender: 'male',
  bio: 'Staff Architect at Infosys. Commuting daily from HSR to E-City.',
};

export const INITIAL_USERS: User[] = [
  CURRENT_USER,
  {
    id: 'usr-102',
    name: 'Priya Narayanan',
    phone: '+91 98862 33419',
    email: 'priya.n@gmail.com',
    workEmail: 'priya.n@wipro.com',
    company: 'Wipro Technologies (Sarjapur Campus)',
    rating: 4.95,
    totalRides: 118,
    isPhoneVerified: true,
    isWorkVerified: true,
    isGovtIdVerified: true,
    isDrivingLicenseVerified: true,
    gender: 'female',
    bio: 'Product Lead. Strictly eco-friendly and verified co-commuters.',
  },
  {
    id: 'usr-103',
    name: 'Rahul Deshmukh',
    phone: '+91 99001 88472',
    email: 'rahul.d@gmail.com',
    workEmail: 'rahul.d@flipkart.com',
    company: 'Flipkart (Cessna Business Park, ORR)',
    rating: 4.86,
    totalRides: 84,
    isPhoneVerified: true,
    isWorkVerified: true,
    isGovtIdVerified: true,
    isDrivingLicenseVerified: true,
    gender: 'male',
    bio: 'Engineering Manager. Drives Tata Nexon EV, peaceful drive with podcast.',
  },
  {
    id: 'usr-104',
    name: 'Sneha Hegde',
    phone: '+91 97410 44521',
    email: 'sneha.h@gmail.com',
    workEmail: 'sneha.h@amazon.com',
    company: 'Amazon Development Centre (Brigade Gateway)',
    rating: 4.92,
    totalRides: 63,
    isPhoneVerified: true,
    isWorkVerified: true,
    isGovtIdVerified: true,
    isDrivingLicenseVerified: false,
    gender: 'female',
    bio: 'UX Designer. Daily commute between Indiranagar and Manyata/Gateway.',
  },
  {
    id: 'usr-105',
    name: 'Karthik Somayaji',
    phone: '+91 98452 77123',
    email: 'karthik.s@gmail.com',
    workEmail: 'karthik.s@accenture.com',
    company: 'Accenture (RMZ Ecoworld, Bellandur)',
    rating: 4.88,
    totalRides: 152,
    isPhoneVerified: true,
    isWorkVerified: true,
    isGovtIdVerified: true,
    isDrivingLicenseVerified: true,
    gender: 'male',
    bio: 'Solutions Architect. Regular commute along ORR corridor.',
  }
];

export const TECH_CORRIDORS: TechCorridor[] = [
  {
    id: 'corr-orr',
    name: 'Outer Ring Road (ORR) Tech Spine',
    subCorridors: ['Silk Board', 'HSR Layout', 'Bellandur', 'Marathahalli', 'Kadubeesanahalli'],
    distanceKm: 22,
    avgTravelTimeMin: 55,
    activeCarpools: 1420,
    avgCostPerSeat: 75,
    co2SavedKgMonth: 28400,
    keyStops: ['HSR BDA Complex', 'Agara Junction', 'Bellandur RMZ Ecoworld', 'Cessna Business Park', 'Marathahalli Bridge']
  },
  {
    id: 'corr-ecity',
    name: 'Electronic City Express Corridor',
    subCorridors: ['Silk Board Flyover', 'Bommanahalli', 'Kudlu Gate', 'Electronic City Phase 1 & 2'],
    distanceKm: 18,
    avgTravelTimeMin: 40,
    activeCarpools: 980,
    avgCostPerSeat: 65,
    co2SavedKgMonth: 19600,
    keyStops: ['Silk Board Junction', 'Roopena Agrahara', 'Electronic City Toll', 'Infosys Gate 1', 'Wipro Phase 1 Gate']
  },
  {
    id: 'corr-whitefield',
    name: 'Whitefield - ITPL Corridor',
    subCorridors: ['Indiranagar', 'Old Airport Road', 'HAL', 'Kundalahalli', 'ITPL Whitefield'],
    distanceKm: 24,
    avgTravelTimeMin: 60,
    activeCarpools: 890,
    avgCostPerSeat: 80,
    co2SavedKgMonth: 17800,
    keyStops: ['Indiranagar Metro', 'HAL Main Gate', 'Kundalahalli Gate', 'Brookefield', 'ITPL Main Entrance']
  },
  {
    id: 'corr-manyata',
    name: 'Hebbal - Manyata Tech Park Corridor',
    subCorridors: ['Koramangala', 'MG Road', 'Mekhri Circle', 'Hebbal Flyover', 'Nagawara Manyata'],
    distanceKm: 19,
    avgTravelTimeMin: 45,
    activeCarpools: 740,
    avgCostPerSeat: 70,
    co2SavedKgMonth: 14800,
    keyStops: ['MG Road Metro', 'Hebbal Flyover', 'Nagawara Junction', 'Manyata Embassy Gate 1', 'Manyata Gate 5']
  },
  {
    id: 'corr-sarjapur',
    name: 'Sarjapur Road - Haralur Hub',
    subCorridors: ['Koramangala', 'Harlur', 'Kasavanahalli', 'Carmelaram', 'Wipro Sarjapur'],
    distanceKm: 16,
    avgTravelTimeMin: 35,
    activeCarpools: 620,
    avgCostPerSeat: 60,
    co2SavedKgMonth: 12400,
    keyStops: ['Koramangala Sony World', 'Iblur Camp', 'Kaadubeesanahalli', 'Wipro Corporate Office']
  }
];

export const INITIAL_RIDES: Ride[] = [
  {
    id: 'ride-01',
    driverId: 'usr-103',
    driver: INITIAL_USERS[2], // Rahul Deshmukh
    vehicle: {
      id: 'veh-1',
      userId: 'usr-103',
      make: 'Tata',
      model: 'Nexon EV Dark Edition',
      color: 'Midnight Black',
      plateNumber: 'KA 01 MR 7812',
      seats: 4,
      isEv: true,
    },
    origin: 'HSR Layout Sector 2',
    destination: 'Whitefield (ITPL Gate 2)',
    corridor: 'Outer Ring Road (ORR) Tech Spine',
    stops: [
      { name: 'HSR Layout Sector 2', timeEstimate: '08:30 AM', lat: 12.9121, lng: 77.6446 },
      { name: 'Agara Flyover', timeEstimate: '08:38 AM', lat: 12.9242, lng: 77.6508 },
      { name: 'Bellandur (RMZ Ecoworld)', timeEstimate: '08:48 AM', lat: 12.9288, lng: 77.6833 },
      { name: 'Marathahalli Bridge', timeEstimate: '09:02 AM', lat: 12.9554, lng: 77.7011 },
      { name: 'ITPL Main Gate', timeEstimate: '09:18 AM', lat: 12.9863, lng: 77.7314 }
    ],
    departureDate: 'Today',
    departureTime: '08:30 AM',
    returnTime: '06:15 PM',
    isRecurring: true,
    recurringDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    totalSeats: 3,
    availableSeats: 2,
    pricePerSeat: 75,
    status: 'active',
    ridePin: '4829',
    allowWomenOnly: false,
    coWorkersOnly: false,
    notes: 'AC on. Non-smoking. Drops off right inside Ecoworld or ITPL gate.'
  },
  {
    id: 'ride-02',
    driverId: 'usr-102',
    driver: INITIAL_USERS[1], // Priya Narayanan
    vehicle: {
      id: 'veh-2',
      userId: 'usr-102',
      make: 'Hyundai',
      model: 'Creta SX(O)',
      color: 'Polar White',
      plateNumber: 'KA 03 NC 4190',
      seats: 4,
      isEv: false,
    },
    origin: 'Koramangala 4th Block',
    destination: 'Wipro Corporate Office (Sarjapur)',
    corridor: 'Sarjapur Road - Haralur Hub',
    stops: [
      { name: 'Koramangala 4th Block', timeEstimate: '08:45 AM', lat: 12.9345, lng: 77.6256 },
      { name: 'Iblur Junction', timeEstimate: '08:58 AM', lat: 12.9221, lng: 77.6698 },
      { name: 'Kaikondrahalli Lake', timeEstimate: '09:08 AM', lat: 12.9102, lng: 77.6841 },
      { name: 'Wipro Sarjapur Gate 3', timeEstimate: '09:20 AM', lat: 12.9088, lng: 77.6975 }
    ],
    departureDate: 'Today',
    departureTime: '08:45 AM',
    returnTime: '06:30 PM',
    isRecurring: true,
    recurringDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    totalSeats: 3,
    availableSeats: 2,
    pricePerSeat: 60,
    status: 'active',
    ridePin: '6192',
    allowWomenOnly: true,
    coWorkersOnly: true,
    notes: 'Women commuters & verified IT colleagues preferred. Quiet relaxed commute.'
  },
  {
    id: 'ride-03',
    driverId: 'usr-105',
    driver: INITIAL_USERS[4], // Karthik Somayaji
    vehicle: {
      id: 'veh-3',
      userId: 'usr-105',
      make: 'Honda',
      model: 'City ZX',
      color: 'Lunar Silver',
      plateNumber: 'KA 05 MN 9231',
      seats: 4,
      isEv: false,
    },
    origin: 'Indiranagar 100ft Road',
    destination: 'Manyata Embassy Business Park',
    corridor: 'Hebbal - Manyata Tech Park Corridor',
    stops: [
      { name: 'Indiranagar 100ft Road', timeEstimate: '08:20 AM', lat: 12.9719, lng: 77.6412 },
      { name: 'Ulsoor Lake', timeEstimate: '08:30 AM', lat: 12.9825, lng: 77.6200 },
      { name: 'Hebbal Flyover', timeEstimate: '08:48 AM', lat: 13.0358, lng: 77.5970 },
      { name: 'Manyata Gate 2', timeEstimate: '09:00 AM', lat: 13.0489, lng: 77.6208 }
    ],
    departureDate: 'Today',
    departureTime: '08:20 AM',
    returnTime: '05:45 PM',
    isRecurring: true,
    recurringDays: ['Mon', 'Wed', 'Thu', 'Fri'],
    totalSeats: 3,
    availableSeats: 1,
    pricePerSeat: 70,
    status: 'active',
    ridePin: '3381',
    allowWomenOnly: false,
    coWorkersOnly: false,
    notes: 'Will wait max 3 mins at Indiranagar Metro pillar 88.'
  },
  {
    id: 'ride-04',
    driverId: 'usr-101',
    driver: CURRENT_USER, // Aravind Swaminathan (User himself offering a ride)
    vehicle: {
      id: 'veh-4',
      userId: 'usr-101',
      make: 'Skoda',
      model: 'Kushaq Style',
      color: 'Carbon Steel',
      plateNumber: 'KA 51 ML 5504',
      seats: 4,
      isEv: false,
    },
    origin: 'HSR Layout Sector 1',
    destination: 'Electronic City Phase 1 (Infosys Gate 1)',
    corridor: 'Electronic City Express Corridor',
    stops: [
      { name: 'HSR Sector 1 BDA', timeEstimate: '08:15 AM', lat: 12.9112, lng: 77.6421 },
      { name: 'Silk Board Junction', timeEstimate: '08:28 AM', lat: 12.9177, lng: 77.6238 },
      { name: 'Electronic City Elevated Toll', timeEstimate: '08:42 AM', lat: 12.8530, lng: 77.6660 },
      { name: 'Infosys Main Campus Gate', timeEstimate: '08:52 AM', lat: 12.8452, lng: 77.6601 }
    ],
    departureDate: 'Today',
    departureTime: '08:15 AM',
    returnTime: '06:00 PM',
    isRecurring: true,
    recurringDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    totalSeats: 3,
    availableSeats: 3,
    pricePerSeat: 65,
    status: 'active',
    ridePin: '7419',
    allowWomenOnly: false,
    coWorkersOnly: true,
    notes: 'Takes the elevated expressway to avoid Silk Board jam.'
  }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'bk-801',
    rideId: 'ride-01',
    ride: INITIAL_RIDES[0],
    passengerId: 'usr-101',
    passenger: CURRENT_USER,
    seatsBooked: 1,
    pickupPoint: 'HSR Layout Sector 2 (Near BDA)',
    dropPoint: 'Bellandur (RMZ Ecoworld)',
    fare: 75,
    status: 'confirmed',
    bookedAt: 'Today, 07:15 AM',
    ridePin: '4829',
    ratedByPassenger: false
  }
];

export const KARNATAKA_CITIES: KarnatakaCity[] = [
  {
    id: 'blr',
    name: 'Bengaluru (Silicon Valley)',
    region: 'South Karnataka',
    status: 'active',
    targetLaunch: 'Live (Phase 1 Hub)',
    commutersDaily: '3.8M daily tech commuters',
    primaryCorridors: ['ORR Tech Corridor', 'Electronic City Expressway', 'Whitefield ITPL', 'Manyata Embassy Tech Park', 'Sarjapur Road']
  },
  {
    id: 'mys',
    name: 'Mysuru (Heritage & IT Hub)',
    region: 'South Karnataka',
    status: 'beta',
    targetLaunch: 'Q4 2026 (Phase 2)',
    commutersDaily: '280K commuters & intercity corridor',
    primaryCorridors: ['Bengaluru-Mysuru Expressway Corridor', 'Hebbal Industrial Estate', 'Infosys Hebbal Mysore Campus', 'Vijayanagar']
  },
  {
    id: 'mng',
    name: 'Mangaluru (Coastal FinTech/Port)',
    region: 'Coastal Karnataka',
    status: 'planned',
    targetLaunch: 'Q1 2027 (Phase 3)',
    commutersDaily: '190K coastal commuters',
    primaryCorridors: ['Kottara Chowki - Hampankatta', 'Infosys Mudipu Campus', 'Baikampady Industrial Spine']
  },
  {
    id: 'hub',
    name: 'Hubballi - Dharwad (Twin Cities Hub)',
    region: 'North Karnataka',
    status: 'planned',
    targetLaunch: 'Q2 2027 (Phase 4)',
    commutersDaily: '240K twin-city commuters',
    primaryCorridors: ['BRTS Corridor Hubballi to Dharwad', 'Tarihal Industrial Estate', 'IIT Dharwad Hub']
  },
  {
    id: 'bgm',
    name: 'Belagavi (Aerospace & Foundry)',
    region: 'North-West Karnataka',
    status: 'planned',
    targetLaunch: 'Q3 2027 (Phase 5)',
    commutersDaily: '160K manufacturing commuters',
    primaryCorridors: ['Udyambag Industrial Hub', 'Auto Nagar to Fort Road', 'Khanapur Road']
  },
  {
    id: 'tmk',
    name: 'Tumakuru (Industrial Smart City)',
    region: 'Central Karnataka',
    status: 'planned',
    targetLaunch: 'Q4 2027 (Phase 6)',
    commutersDaily: '120K industrial commuters',
    primaryCorridors: ['Vasanthanarasapura Industrial Park', 'Bengaluru-Tumakuru NH48 Corridor']
  }
];

export const CORRIDOR_POPULAR_PAIRS = [
  { from: 'HSR Layout', to: 'Whitefield (ITPL)', time: '48 min', avgFare: '₹75', activeDrivers: 148 },
  { from: 'Electronic City', to: 'RMZ Ecoworld (Bellandur)', time: '38 min', avgFare: '₹65', activeDrivers: 112 },
  { from: 'Indiranagar', to: 'Manyata Tech Park', time: '35 min', avgFare: '₹70', activeDrivers: 94 },
  { from: 'Koramangala', to: 'Wipro Corporate Sarjapur', time: '28 min', avgFare: '₹60', activeDrivers: 88 },
  { from: 'BTM Layout', to: 'Bagmane Tech Park (CV Raman Nagar)', time: '42 min', avgFare: '₹70', activeDrivers: 76 }
];
