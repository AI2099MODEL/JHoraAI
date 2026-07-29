export interface BirthProfile {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  place: string;
  latitude: number;
  longitude: number;
  timezone: string;
  gender: 'male' | 'female' | 'other' | '';
  type: 'personal' | 'family' | 'business' | 'horary';
  horaryNumber?: number;
}
