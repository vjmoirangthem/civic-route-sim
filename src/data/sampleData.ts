// Sample data based on Allahabad/Prayagraj GIS survey data
import { Citizen, Route, GarbageTruck } from '@/types';

// Sample citizens from the uploaded data (Transport Nagar area)
export const sampleCitizens: Citizen[] = [
  {
    id: 'c1',
    name: 'Bharat Singh',
    address: '54K/5L/3R, Umarpur Neewa',
    ward: 'Transport Nagar',
    mohalla: 'Kandhai Pur',
    latitude: 25.45952723,
    longitude: 81.77627969,
    status: 'pending',
  },
  {
    id: 'c2',
    name: 'Tirath Nath Pal',
    address: '87L/18/1, Bhola Ka Purwa',
    ward: 'Sulemsarai',
    mohalla: 'Ramman Ka Purwa',
    latitude: 25.4514449,
    longitude: 81.7898056,
    status: 'pending',
  },
  {
    id: 'c3',
    name: 'Daya Shankar Rai',
    address: '46/21A-1/9, Ramman Ka Purwa',
    ward: 'Sulemsarai',
    mohalla: 'Tar Bhgh',
    latitude: 25.45075436,
    longitude: 81.79074123,
    status: 'pending',
  },
  {
    id: 'c4',
    name: 'Pyare Lal',
    address: '86L/12A, Tar Bhgh',
    ward: 'Sulemsarai',
    mohalla: 'Ramman Ka Purwa',
    latitude: 25.45292441,
    longitude: 81.79107079,
    status: 'pending',
  },
  {
    id: 'c5',
    name: 'Chandra Kant Singh',
    address: '101M/16R/1J, Bhola Ka Purwa',
    ward: 'Sulemsarai',
    mohalla: 'Bhola Ka Purwa',
    latitude: 25.45693571,
    longitude: 81.79028777,
    status: 'pending',
  },
  {
    id: 'c6',
    name: 'Kanti Singh',
    address: '82E/5, Umarpur Neewa',
    ward: 'Sulemsarai',
    mohalla: 'Ramman Ka Purwa',
    latitude: 25.45463829,
    longitude: 81.79156568,
    status: 'pending',
  },
  {
    id: 'c7',
    name: 'Anita Devi',
    address: '365/2J/1, Sulem Sarai Awas Yojna',
    ward: 'Jayantipur',
    mohalla: 'Sulem Sarai',
    latitude: 25.44623322,
    longitude: 81.78820543,
    status: 'pending',
  },
  {
    id: 'c8',
    name: 'Shashi Lata Srivastava',
    address: '144L/7C/5Z, Ramman Ka Purwa',
    ward: 'Sulemsarai',
    mohalla: 'Ramman Ka Purwa',
    latitude: 25.45435235,
    longitude: 81.79195165,
    status: 'pending',
  },
];

// Route that covers the sample citizens
export const sampleRoutes: Route[] = [
  {
    id: 'route1',
    name: 'Transport Nagar Route A',
    truckId: 'truck1',
    wardsCovered: ['Transport Nagar', 'Sulemsarai'],
    totalDistance: 3.2,
    coordinates: [
      [81.775, 25.460],    // Start point
      [81.777, 25.459],    // Near Bharat Singh
      [81.780, 25.458],
      [81.785, 25.456],
      [81.788, 25.455],
      [81.790, 25.454],    // Near Kanti Singh
      [81.791, 25.453],
      [81.791, 25.451],    // Near Daya Shankar
      [81.790, 25.449],
      [81.788, 25.447],
      [81.788, 25.446],    // Near Anita Devi
    ],
  },
  {
    id: 'route2',
    name: 'Sulemsarai Route B',
    truckId: 'truck2',
    wardsCovered: ['Sulemsarai'],
    totalDistance: 2.5,
    coordinates: [
      [81.792, 25.455],    // Start
      [81.791, 25.454],
      [81.790, 25.453],
      [81.789, 25.452],
      [81.790, 25.451],
      [81.791, 25.450],
      [81.792, 25.449],
    ],
  },
];

export const sampleTrucks: GarbageTruck[] = [
  {
    id: 'truck1',
    name: 'TN-01 (Eicher)',
    currentPosition: [81.775, 25.460],
    speed: 15,
    status: 'idle',
    routeId: 'route1',
    progress: 0,
  },
  {
    id: 'truck2',
    name: 'TN-02 (Tata)',
    currentPosition: [81.792, 25.455],
    speed: 12,
    status: 'idle',
    routeId: 'route2',
    progress: 0,
  },
];

// Map center for the Transport Nagar area
export const mapCenter: [number, number] = [81.785, 25.453];
export const mapZoom = 14;
