export interface Event {
  id: string;
  title: string;
  date: string;
  year: string;
  type: string;
  img: string;
  description: string;
  location: string;
  time: string;
  story: string;
  timeline: { time: string; activity: string }[];
  impact: { label: string; value: string }[];
  isUpcoming: boolean;
  gallery?: string[];
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock?: number;
  image: string;
  gallery?: string[];
  description: string;
  category: string;
  impact: string;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: any;
  status: 'read' | 'unread';
}

export interface RSVP {
  id: string;
  eventId: string;
  eventTitle: string;
  name: string;
  email: string;
  guests: number;
  createdAt: any;
}
