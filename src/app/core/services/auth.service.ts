import { Injectable, signal, computed, inject } from '@angular/core';
import { UserProfile } from '../models/user.model';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private toastService = inject(ToastService);
  private readonly FIRESTORE_USERS_URL =
    'https://firestore.googleapis.com/v1/projects/tbzb-bidar/databases/(default)/documents/tbzb_users';

  currentUser = signal<UserProfile | null>(this.loadStoredUser());
  isLoggedIn = computed(() => !!this.currentUser());
  isLoading = signal<boolean>(false);

  private loadStoredUser(): UserProfile | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem('tbzb_logged_user');
        if (stored) {
          return JSON.parse(stored) as UserProfile;
        }
      }
    } catch (e) {}
    return null;
  }

  private saveStoredUser(user: UserProfile | null): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        if (user) {
          localStorage.setItem('tbzb_logged_user', JSON.stringify(user));
        } else {
          localStorage.removeItem('tbzb_logged_user');
        }
      }
    } catch (e) {}
  }

  /**
   * Register a new user in Google Cloud Firestore
   */
  async register(
    name: string,
    mobileNumber: string,
    password: string
  ): Promise<{ success: boolean; message: string }> {
    const cleanMobile = mobileNumber.replace(/\D/g, '').slice(-10);
    if (!cleanMobile || cleanMobile.length !== 10) {
      return { success: false, message: 'Please enter a valid 10-digit mobile number' };
    }
    if (!name || name.trim().length < 2) {
      return { success: false, message: 'Please enter your full name' };
    }
    if (!password || password.length < 4) {
      return { success: false, message: 'Password must be at least 4 characters long' };
    }

    this.isLoading.set(true);

    try {
      // 1. Check if user already exists
      const checkRes = await fetch(`${this.FIRESTORE_USERS_URL}/${cleanMobile}`);
      if (checkRes.ok) {
        this.isLoading.set(false);
        return { success: false, message: 'Mobile number already registered. Please login.' };
      }

      // 2. Create user document in Firestore
      const now = new Date().toISOString();
      const payload = {
        fields: {
          name: { stringValue: name.trim() },
          mobileNumber: { stringValue: cleanMobile },
          password: { stringValue: password },
          createdAt: { stringValue: now }
        }
      };

      const createRes = await fetch(`${this.FIRESTORE_USERS_URL}/${cleanMobile}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      this.isLoading.set(false);

      if (createRes.ok) {
        const newUser: UserProfile = {
          id: cleanMobile,
          name: name.trim(),
          mobileNumber: cleanMobile,
          createdAt: now
        };
        this.currentUser.set(newUser);
        this.saveStoredUser(newUser);
        this.toastService.show(`Welcome to The Bite Zone, ${name.trim()}!`, 'success');
        return { success: true, message: 'Account created successfully' };
      } else {
        return { success: false, message: 'Could not create account on server. Try again.' };
      }
    } catch (err) {
      this.isLoading.set(false);
      return { success: false, message: 'Network error connecting to cloud server.' };
    }
  }

  /**
   * Login user by validating mobile number and password against Firestore
   */
  async login(
    mobileNumber: string,
    password: string
  ): Promise<{ success: boolean; message: string }> {
    const cleanMobile = mobileNumber.replace(/\D/g, '').slice(-10);
    if (!cleanMobile || cleanMobile.length !== 10) {
      return { success: false, message: 'Please enter a valid 10-digit mobile number' };
    }
    if (!password) {
      return { success: false, message: 'Please enter your password' };
    }

    this.isLoading.set(true);

    try {
      const res = await fetch(`${this.FIRESTORE_USERS_URL}/${cleanMobile}`);
      this.isLoading.set(false);

      if (!res.ok) {
        return {
          success: false,
          message: 'Is mobile number par koi account nahi mila! Pehle apna account create kijiye.'
        };
      }

      const doc = await res.json();
      const fields = doc.fields || {};
      const savedPass = fields.password?.stringValue;
      const savedName = fields.name?.stringValue || 'Customer';
      const createdAt = fields.createdAt?.stringValue || new Date().toISOString();
      const savedAddress = fields.savedAddress?.stringValue;

      if (savedPass !== password) {
        return { success: false, message: 'Incorrect password. Try again or reset password.' };
      }

      const user: UserProfile = {
        id: cleanMobile,
        name: savedName,
        mobileNumber: cleanMobile,
        createdAt,
        savedAddress
      };

      this.currentUser.set(user);
      this.saveStoredUser(user);
      this.toastService.show(`Welcome back, ${savedName}!`, 'success');
      return { success: true, message: 'Login successful' };
    } catch (err) {
      this.isLoading.set(false);
      return { success: false, message: 'Network error connecting to server.' };
    }
  }

  /**
   * Reset password for an existing registered mobile number
   */
  async resetPassword(
    mobileNumber: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    const cleanMobile = mobileNumber.replace(/\D/g, '').slice(-10);
    if (!cleanMobile || cleanMobile.length !== 10) {
      return { success: false, message: 'Please enter a valid 10-digit mobile number' };
    }
    if (!newPassword || newPassword.length < 4) {
      return { success: false, message: 'New password must be at least 4 characters long' };
    }

    this.isLoading.set(true);

    try {
      // 1. Verify user exists
      const checkRes = await fetch(`${this.FIRESTORE_USERS_URL}/${cleanMobile}`);
      if (!checkRes.ok) {
        this.isLoading.set(false);
        return { success: false, message: 'No registered account found with this mobile number.' };
      }

      const doc = await checkRes.json();
      const fields = doc.fields || {};
      const name = fields.name?.stringValue || 'Customer';

      // 2. Patch new password
      const patchUrl = `${this.FIRESTORE_USERS_URL}/${cleanMobile}?updateMask.fieldPaths=password`;
      const patchRes = await fetch(patchUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: {
            password: { stringValue: newPassword }
          }
        })
      });

      this.isLoading.set(false);

      if (patchRes.ok) {
        const user: UserProfile = {
          id: cleanMobile,
          name,
          mobileNumber: cleanMobile,
          createdAt: fields.createdAt?.stringValue || new Date().toISOString()
        };
        this.currentUser.set(user);
        this.saveStoredUser(user);
        this.toastService.show('Password updated successfully!', 'success');
        return { success: true, message: 'Password updated successfully' };
      } else {
        return { success: false, message: 'Could not update password on server.' };
      }
    } catch (err) {
      this.isLoading.set(false);
      return { success: false, message: 'Network error connecting to server.' };
    }
  }

  /**
   * Log out customer
   */
  logout(): void {
    const userName = this.currentUser()?.name || '';
    this.currentUser.set(null);
    this.saveStoredUser(null);
    this.toastService.show(`Logged out${userName ? ' ' + userName : ''}. See you again!`, 'info');
  }

  /**
   * Update saved address in Firestore
   */
  async updateSavedAddress(address: string): Promise<void> {
    const user = this.currentUser();
    if (!user) return;

    user.savedAddress = address;
    this.currentUser.set({ ...user });
    this.saveStoredUser(user);

    try {
      const patchUrl = `${this.FIRESTORE_USERS_URL}/${user.id}?updateMask.fieldPaths=savedAddress`;
      await fetch(patchUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: {
            savedAddress: { stringValue: address }
          }
        })
      });
    } catch (e) {}
  }
}

