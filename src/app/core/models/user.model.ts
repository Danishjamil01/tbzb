export interface UserProfile {
  id: string; // mobile number without country code
  name: string;
  mobileNumber: string;
  createdAt: string;
  savedAddress?: string;
}

