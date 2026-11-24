import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { BusinessStatusService } from '../../core/services/business-status.service';
import { ToastService } from '../../core/services/toast.service';
import { InrPipe } from '../../shared/pipes/inr.pipe';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { PlacedOrder, KitchenOrder } from '../../core/models/order.model';
import { OrderService } from '../../core/services/order.service';
import { PlatformService } from '../../core/services/platform.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-checkout-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InrPipe, IconComponent],
  template: `
    @if (cartService.isCheckoutModalOpen()) {
      <div class="modal-backdrop" (click)="close()"></div>

      <div class="checkout-modal-dialog" role="dialog" aria-modal="true" aria-label="Checkout">
        <!-- Minimal Modal Header / Mobile Screen Header -->
        <div class="checkout-header">
          <div class="header-left-wrap">
            <button class="btn-back" (click)="close()" aria-label="Go back">
              <app-icon name="arrow-left" [size]="18" />
            </button>
            <div class="header-info">
              <h3 class="modal-title">Checkout</h3>
              <span class="header-sub">{{ cartService.totalItemCount() }} {{ cartService.totalItemCount() === 1 ? 'item' : 'items' }} • Doorstep Delivery</span>
            </div>
          </div>
          <button class="btn-close" (click)="close()" aria-label="Close checkout">
            <app-icon name="x" [size]="18" />
          </button>
        </div>

        <!-- Checkout Form Body -->
        <div class="checkout-body">
          <form [formGroup]="checkoutForm" (ngSubmit)="onSubmitOrder()" class="checkout-form">
            
            <!-- 1. Customer Details -->
            <div class="form-card">
              <div class="card-heading">
                <app-icon name="user" [size]="15" />
                <span>Customer Details</span>
              </div>

              <div class="form-grid">
                <div class="form-group">
                  <label for="fullName">Full Name <span class="req">*</span></label>
                  <input
                    id="fullName"
                    type="text"
                    formControlName="fullName"
                    placeholder="Enter your name"
                    class="form-control"
                    [class.error]="isFieldInvalid('fullName')"
                  />
                  @if (isFieldInvalid('fullName')) {
                    <span class="field-error">Please enter your name</span>
                  }
                </div>

                <div class="form-group">
                  <label for="mobileNumber">WhatsApp Number <span class="req">*</span></label>
                  <div class="phone-wrap" [class.error]="isFieldInvalid('mobileNumber')">
                    <span class="prefix">+91</span>
                    <input
                      id="mobileNumber"
                      type="tel"
                      formControlName="mobileNumber"
                      placeholder="10-digit mobile number"
                      maxlength="10"
                      class="phone-input"
                    />
                  </div>
                  @if (isFieldInvalid('mobileNumber')) {
                    <span class="field-error">Valid 10-digit number required</span>
                  }
                </div>
              </div>
            </div>

            <!-- 2. Delivery Address in Bidar -->
            <div class="form-card">
              <div class="card-heading">
                <app-icon name="map-pin" [size]="15" />
                <span>Delivery Address (Bidar Only)</span>
              </div>

              <div class="form-grid">
                <div class="form-group">
                  <label for="flatNumber">House / Building No. <span class="req">*</span></label>
                  <input
                    id="flatNumber"
                    type="text"
                    formControlName="flatNumber"
                    placeholder="e.g. Flat 302, Green Villa"
                    class="form-control"
                    [class.error]="isFieldInvalid('flatNumber')"
                  />
                  @if (isFieldInvalid('flatNumber')) {
                    <span class="field-error">House or building required</span>
                  }
                </div>

                <div class="form-group">
                  <label for="areaLocality">Area / Locality <span class="req">*</span></label>
                  <input
                    id="areaLocality"
                    type="text"
                    formControlName="areaLocality"
                    placeholder="e.g. Gandhi Gunj, Mailoor, Naubad"
                    class="form-control"
                    [class.error]="isFieldInvalid('areaLocality')"
                  />
                  @if (isFieldInvalid('areaLocality')) {
                    <span class="field-error">Area in Bidar is required</span>
                  }
                </div>
              </div>

              <div class="form-group mt-2">
                <label for="landmark">Landmark / Note <span class="opt">(Optional)</span></label>
                <input
                  id="landmark"
                  type="text"
                  formControlName="landmark"
                  placeholder="e.g. Near Big Mosque / Opposite Hospital"
                  class="form-control"
                />
              </div>

              <!-- Compact Live GPS Location Verification -->
              <div
                class="gps-location-card"
                [class.located]="userLocation() !== null && !isOutsideBidar()"
                [class.blocked-location]="isOutsideBidar()"
              >
                @if (userLocation(); as loc) {
                  @if (isOutsideBidar()) {
                    <div class="gps-state-row blocked">
                      <div class="gps-state-info">
                        <app-icon name="alert-circle" [size]="16" />
                        <div>
                          <strong>Outside Bidar ({{ userDistanceKm() }} km)</strong>
                          <p>Delivery is strictly within Bidar city limits.</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        class="btn-gps-action retry"
                        (click)="fetchCurrentLocation()"
                        [disabled]="isLocating()"
                      >
                        Re-check
                      </button>
                    </div>
                  } @else {
                    <div class="gps-state-row verified">
                      <div class="gps-state-info">
                        <app-icon name="check" [size]="16" />
                        <div>
                          <strong class="text-success">Verified in Bidar ({{ userDistanceKm() }} km)</strong>
                          <p>Live coordinates attached to your order.</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        class="btn-gps-action"
                        (click)="fetchCurrentLocation()"
                        [disabled]="isLocating()"
                      >
                        Re-check
                      </button>
                    </div>
                  }
                } @else {
                  <button
                    type="button"
                    class="btn-gps-fetch"
                    (click)="fetchCurrentLocation(true)"
                    [disabled]="isLocating()"
                  >
                    @if (isLocating()) {
                      <span class="spinner-dot"></span>
                      <span>Detecting Live GPS...</span>
                    } @else {
                      <app-icon name="map-pin" [size]="15" />
                      <span>📍 Auto-Detect Live Location (Optional)</span>
                    }
                  </button>
                }

                @if (locationError()) {
                  <div class="gps-error-note">
                    <app-icon name="alert-circle" [size]="13" />
                    <span>{{ locationError() }}</span>
                  </div>
                }
              </div>
            </div>

            <!-- 3. Payment Method & Online QR -->
            <div class="form-card">
              <div class="card-heading">
                <app-icon name="shield-check" [size]="15" />
                <span>Payment Mode</span>
              </div>

              <div class="payment-tabs">
                <div
                  class="payment-tab disabled-tab"
                  (click)="onSelectOnlinePayment($event)"
                >
                  <div class="tab-radio-circle"></div>
                  <div class="tab-meta">
                    <div class="payment-title-row">
                      <strong>Online UPI (Scan QR)</strong>
                      <span class="coming-soon-badge">Coming Soon</span>
                    </div>
                    <span>Google Pay, PhonePe, Paytm</span>
                  </div>
                </div>

                <label
                  class="payment-tab"
                  [class.selected]="checkoutForm.get('paymentMethod')?.value === 'cod'"
                >
                  <input type="radio" formControlName="paymentMethod" value="cod" class="sr-only" />
                  <div class="tab-radio-circle">
                    @if (checkoutForm.get('paymentMethod')?.value === 'cod') {
                      <span class="inner-dot"></span>
                    }
                  </div>
                  <div class="tab-meta">
                    <div class="payment-title-row">
                      <strong>Cash on Delivery (COD)</strong>
                      <span class="active-badge">Active</span>
                    </div>
                    <span>Pay cash to delivery rider</span>
                  </div>
                </label>
              </div>
            </div>

            <!-- 4. Total & Confirm Order -->
            <div class="checkout-footer-card">
              <div class="total-row">
                <div class="total-text-col">
                  <span class="total-title">Total Payable</span>
                  @if (calculation().isAfterMidnight) {
                    <span class="fee-note">₹60 late-night delivery included</span>
                  } @else if (calculation().hasPendingDeliveryFee) {
                    <span class="fee-note">Delivery charge confirmed by kitchen</span>
                  }
                </div>
                <div class="total-val">{{ calculation().total | inr }}</div>
              </div>

              @if (isOutsideBidar()) {
                <button
                  type="button"
                  class="btn-submit btn-blocked"
                  disabled
                >
                  <app-icon name="alert-circle" [size]="18" />
                  <span>Delivery Not Available Outside Bidar</span>
                </button>
              } @else if (!authService.isLoggedIn()) {
                <button
                  type="button"
                  class="btn-submit btn-login-required"
                  (click)="onRequireLogin()"
                >
                  <app-icon name="lock" [size]="18" />
                  <span>Log In to Place Order • {{ calculation().total | inr }}</span>
                </button>
              } @else {
                <button
                  type="submit"
                  class="btn-submit"
                  [disabled]="isSubmitting"
                >
                  <app-icon name="check-circle" [size]="20" />
                  <span>Confirm & Place Order • {{ calculation().total | inr }}</span>
                </button>
              }
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.65);
      backdrop-filter: blur(8px);
      z-index: 1050;
      animation: fadeIn 0.18s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .checkout-modal-dialog {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 92%;
      max-width: 500px;
      max-height: 92vh;
      background-color: #FFFFFF;
      border: 1px solid #E5E7EB;
      border-radius: 18px;
      z-index: 1051;
      display: flex;
      flex-direction: column;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
      animation: modalScale 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      overflow: hidden;

      @media (max-width: 640px) {
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        transform: none;
        width: 100%;
        max-width: 100%;
        height: 100%;
        max-height: 100%;
        border-radius: 0;
        border: none;
        box-shadow: none;
        animation: screenSlideUp 0.22s cubic-bezier(0.16, 1, 0.3, 1);
      }
    }

    @keyframes screenSlideUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }

    .checkout-header {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid #F3F4F6;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #FFFFFF;
      position: sticky;
      top: 0;
      z-index: 2;

      @media (max-width: 640px) {
        padding: 12px 14px;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
      }

      .header-left-wrap {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .modal-title {
        font-family: var(--font-heading, inherit);
        font-size: 1.15rem;
        font-weight: 700;
        color: #0F472B;
        margin: 0;
      }

      .header-sub {
        font-size: 12px;
        color: #6B7280;
        display: block;
        margin-top: 1px;
      }
    }

    .btn-back {
      display: none;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 1px solid #E5E7EB;
      background: #FAF7F2;
      color: #374151;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.15s ease;

      @media (max-width: 640px) {
        display: flex;
      }

      &:hover {
        background: #F3F4F6;
        color: #111827;
      }
    }

    .btn-close {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 1px solid #E5E7EB;
      background: #FAF7F2;
      color: #6B7280;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.15s ease;

      @media (max-width: 640px) {
        display: none;
      }

      &:hover {
        background: #F3F4F6;
        color: #111827;
      }
    }

    .checkout-body {
      padding: 1rem 1.15rem;
      overflow-y: auto;
      flex: 1;
      background: #FAF7F2;
    }

    .checkout-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .form-card {
      background: #FFFFFF;
      border: 1px solid #EAEAEA;
      border-radius: 14px;
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.02);
    }

    .card-heading {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 700;
      color: #0F472B;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 10px;

      @media (min-width: 440px) {
        grid-template-columns: 1fr 1fr;
      }
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 4px;

      label {
        font-size: 12px;
        color: #374151;
        font-weight: 600;
      }
    }

    .req { color: #DC2626; }
    .opt { color: #9CA3AF; font-weight: normal; }
    .mt-2 { margin-top: 4px; }

    .form-control {
      background-color: #FAF7F2;
      border: 1.5px solid #E5E7EB;
      border-radius: 9px;
      padding: 8px 11px;
      font-size: 13.5px;
      color: #111827;
      transition: all 0.15s ease;

      &::placeholder {
        color: #9CA3AF;
        font-size: 12.5px;
      }

      &:focus {
        outline: none;
        background-color: #FFFFFF;
        border-color: #0F472B;
        box-shadow: 0 0 0 3px rgba(15, 71, 43, 0.08);
      }

      &.error {
        border-color: #DC2626;
        background-color: #FEF2F2;
      }
    }

    .phone-wrap {
      display: flex;
      align-items: center;
      background-color: #FAF7F2;
      border: 1.5px solid #E5E7EB;
      border-radius: 9px;
      overflow: hidden;
      transition: all 0.15s ease;

      &:focus-within {
        background-color: #FFFFFF;
        border-color: #0F472B;
        box-shadow: 0 0 0 3px rgba(15, 71, 43, 0.08);
      }

      &.error {
        border-color: #DC2626;
        background-color: #FEF2F2;
      }

      .prefix {
        padding: 0 10px;
        font-size: 13px;
        font-weight: 700;
        color: #0F472B;
        background: #F3F4F6;
        border-right: 1.5px solid #E5E7EB;
        height: 38px;
        display: flex;
        align-items: center;
      }

      .phone-input {
        border: none;
        border-radius: 0;
        width: 100%;
        background: transparent;
        height: 38px;
        padding: 0 10px;
        font-size: 13.5px;
        color: #111827;

        &:focus {
          outline: none;
        }

        &::placeholder {
          color: #9CA3AF;
          font-size: 12.5px;
        }
      }
    }

    .field-error {
      font-size: 11px;
      color: #DC2626;
      font-weight: 500;
    }

    /* GPS Live Location Card */
    .gps-location-card {
      background: #F8FBF8;
      border: 1.5px dashed #A3D9B5;
      border-radius: 11px;
      padding: 10px 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      transition: all 0.2s ease;
      margin-top: 4px;

      &.located {
        background: #F0FDF4;
        border-style: solid;
        border-color: #22C55E;
      }

      &.blocked-location {
        background: #FEF2F2;
        border-style: solid;
        border-color: #EF4444;
      }
    }

    .btn-gps-fetch {
      width: 100%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 8px 12px;
      background: #0F472B;
      color: #FFFFFF;
      border: none;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;

      &:hover:not(:disabled) {
        background: #0A321E;
      }

      &:disabled {
        opacity: 0.75;
        cursor: not-allowed;
      }
    }

    .spinner-dot {
      width: 12px;
      height: 12px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #FFFFFF;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .gps-state-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;

      &.verified {
        app-icon {
          color: #15803D;
        }
      }

      &.blocked {
        app-icon {
          color: #DC2626;
        }
      }
    }

    .gps-state-info {
      display: flex;
      align-items: flex-start;
      gap: 8px;

      strong {
        font-size: 12px;
        color: #111827;
        display: block;

        &.text-success {
          color: #15803D;
        }
      }

      p {
        margin: 1px 0 0;
        font-size: 11px;
        color: #6B7280;
        line-height: 1.3;
      }
    }

    .btn-gps-action {
      background: #FFFFFF;
      border: 1px solid #D1D5DB;
      border-radius: 6px;
      padding: 4px 8px;
      font-size: 11px;
      font-weight: 600;
      color: #374151;
      cursor: pointer;
      white-space: nowrap;

      &:hover {
        background: #F3F4F6;
      }

      &.retry {
        border-color: #FCA5A5;
        color: #DC2626;
      }
    }

    .gps-error-note {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;
      color: #DC2626;
    }

    /* Payment Tabs */
    .payment-tabs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    .payment-tab {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 9px 11px;
      background: #FAF7F2;
      border: 1.5px solid #E5E7EB;
      border-radius: 11px;
      cursor: pointer;
      transition: all 0.15s ease;

      &:hover {
        border-color: #0F472B;
      }

      &.selected {
        border-color: #0F472B;
        background: rgba(15, 71, 43, 0.05);
      }

      &.disabled-tab {
        opacity: 0.85;
        background: #F3F4F6;
        cursor: pointer;
        border-style: dashed;
        border-color: #D1D5DB;
        &:hover {
          border-color: #F59E0B;
        }
      }

      .payment-title-row {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
      }

      .coming-soon-badge {
        font-size: 9px;
        font-weight: 800;
        background: #FEF3C7;
        color: #B45309;
        padding: 2px 6px;
        border-radius: 4px;
        letter-spacing: 0.3px;
      }

      .active-badge {
        font-size: 9px;
        font-weight: 800;
        background: #DCFCE7;
        color: #15803D;
        padding: 2px 6px;
        border-radius: 4px;
        letter-spacing: 0.3px;
      }
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      border: 0;
    }

    .tab-radio-circle {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 2px solid #0F472B;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      .inner-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #0F472B;
      }
    }

    .tab-meta {
      display: flex;
      flex-direction: column;

      strong {
        font-size: 12px;
        color: #111827;
      }

      span {
        font-size: 10.5px;
        color: #6B7280;
      }
    }

    /* UPI QR Compact Box */
    .qr-compact-box {
      background: #FAF7F2;
      border: 1.5px solid #0F472B;
      border-radius: 12px;
      padding: 12px;
      display: flex;
      align-items: center;
      gap: 14px;
      margin-top: 4px;

      @media (max-width: 420px) {
        flex-direction: column;
        align-items: center;
        text-align: center;
      }
    }

    .qr-display-container {
      background: #FFFFFF;
      padding: 6px;
      border-radius: 10px;
      border: 1px solid #E5E7EB;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      display: flex;
      flex-direction: column;
      align-items: center;
      flex-shrink: 0;

      .qr-image {
        width: 130px;
        height: 130px;
        object-fit: contain;
        display: block;
      }

      .qr-badge {
        font-size: 9.5px;
        font-weight: 700;
        color: #0F472B;
        margin-top: 3px;
      }
    }

    .qr-content-pane {
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex: 1;

      .qr-amount-pill {
        font-size: 12px;
        color: #0F472B;
        background: #FFC82C;
        padding: 3px 8px;
        border-radius: 6px;
        align-self: flex-start;

        @media (max-width: 420px) {
          align-self: center;
        }

        strong {
          font-weight: 800;
        }
      }

      .qr-helper {
        margin: 0;
        font-size: 11.5px;
        color: #4B5563;
        line-height: 1.35;
      }

      .utr-wrap {
        display: flex;
        flex-direction: column;
        gap: 3px;
        margin-top: 2px;

        label {
          font-size: 11px;
          font-weight: 600;
          color: #374151;
          text-align: left;
        }
      }
    }

    /* Total & WhatsApp Button Card */
    .checkout-footer-card {
      background: #FFFFFF;
      border: 1px solid #EAEAEA;
      border-radius: 14px;
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
    }

    .total-row {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .total-title {
        font-size: 13px;
        font-weight: 700;
        color: #0F472B;
        display: block;
      }

      .fee-note {
        font-size: 10.5px;
        color: #6B7280;
        display: block;
      }

      .total-val {
        font-family: var(--font-heading, inherit);
        font-size: 1.35rem;
        font-weight: 800;
        color: #0F472B;
      }
    }

    .btn-submit {
      width: 100%;
      padding: 13px 18px;
      font-size: 14.5px;
      font-weight: 700;
      border-radius: 12px;
      background: #0F472B;
      color: #FFFFFF;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(15, 71, 43, 0.3);
      transition: all 0.2s ease;

      &:hover:not(:disabled) {
        background: #145A38;
        transform: translateY(-1px);
      }

      &:disabled {
        opacity: 0.65;
        cursor: not-allowed;
      }

      &.btn-blocked {
        background: #DC2626;
        box-shadow: none;
      }

      &.btn-login-required {
        background: #F59E0B;
        box-shadow: 0 4px 14px rgba(245, 158, 11, 0.35);

        &:hover {
          background: #D97706;
        }
      }
    }
  `]
})
export class CheckoutModalComponent {
  private fb = inject(FormBuilder);
  cartService = inject(CartService);
  private statusService = inject(BusinessStatusService);
  private toastService = inject(ToastService);
  private orderService = inject(OrderService);
  private platformService = inject(PlatformService);
  authService = inject(AuthService);

  constructor() {
    effect(() => {
      const isOpen = this.cartService.isCheckoutModalOpen();
      const user = this.authService.currentUser();
      if (isOpen) {
        if (user) {
          if (!this.checkoutForm.get('fullName')?.value && user.name) {
            this.checkoutForm.patchValue({ fullName: user.name });
          }
          if (!this.checkoutForm.get('mobileNumber')?.value && user.mobileNumber) {
            this.checkoutForm.patchValue({ mobileNumber: user.mobileNumber });
          }
          if (!this.checkoutForm.get('areaLocality')?.value && user.savedAddress) {
            this.checkoutForm.patchValue({ areaLocality: user.savedAddress });
          }
        }
        const savedLoc = this.platformService.userLocationName();
        if (savedLoc && !this.checkoutForm.get('areaLocality')?.value) {
          if (!this.isForbiddenOutsideCity(savedLoc)) {
            this.checkoutForm.patchValue({ areaLocality: savedLoc });
          } else {
            this.checkoutForm.patchValue({ areaLocality: 'Bidar' });
          }
        }
        const coords = this.platformService.userCoordinates();
        if (coords && !this.userLocation()) {
          this.userLocation.set(coords);
          const dist = this.calculateDistanceKm(this.config.location.latitude, this.config.location.longitude, coords.lat, coords.lng);
          const rDist = Number(dist.toFixed(1));
          this.userDistanceKm.set(rDist);
          this.recheckAddressValidity();
        } else {
          this.recheckAddressValidity();
        }
      }
    });

    // Reactively update validity when user edits address in checkout
    this.checkoutForm.get('areaLocality')?.valueChanges.subscribe(val => {
      this.recheckAddressValidity(val);
    });
  }

  status = this.statusService.status;
  config = this.statusService.config;
  calculation = this.cartService.calculation;

  isSubmitting = false;

  // Geolocation & Geofencing signals
  userLocation = signal<{ lat: number; lng: number } | null>(null);
  userDistanceKm = signal<number | null>(null);
  isOutsideBidar = signal<boolean>(false);
  isLocating = signal<boolean>(false);
  locationError = signal<string | null>(null);

  // Last placed order for confirmation modal
  lastPlacedOrder: PlacedOrder | null = null;

  checkoutForm: FormGroup = this.fb.group({
    orderType: ['delivery', Validators.required],
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    mobileNumber: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
    flatNumber: ['', Validators.required],
    areaLocality: ['', Validators.required],
    landmark: [''],
    paymentMethod: ['cod', Validators.required],
    upiTransactionId: ['']
  });

  isFieldInvalid(fieldName: string): boolean {
    const field = this.checkoutForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSelectOnlinePayment(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.checkoutForm.patchValue({ paymentMethod: 'cod' });
    this.toastService.show(
      'Online UPI is Coming Soon! Please proceed with Cash on Delivery (COD).',
      'info',
      'Coming Soon'
    );
  }

  isForbiddenOutsideCity(text: string): boolean {
    const forbidden = [
      'hyderabad', 'bengaluru', 'bangalore', 'secunderabad', 'mumbai',
      'delhi', 'pune', 'gulbarga', 'kalaburagi', 'humnabad', 'bhalki',
      'aurad', 'basavakalyan', 'chennai', 'kolkata'
    ];
    const lower = (text || '').toLowerCase().trim();
    return forbidden.some(city => lower.includes(city));
  }

  recheckAddressValidity(locality?: string): void {
    const loc = locality ?? this.checkoutForm.get('areaLocality')?.value ?? '';
    const full = `${this.checkoutForm.get('flatNumber')?.value || ''} ${loc} ${this.checkoutForm.get('landmark')?.value || ''}`;

    if (this.isForbiddenOutsideCity(full)) {
      this.isOutsideBidar.set(true);
      return;
    }

    // If real GPS coordinates exist
    if (this.userDistanceKm() !== null) {
      if (this.userDistanceKm()! <= this.config.location.maxDeliveryRadiusKm) {
        this.isOutsideBidar.set(false);
        return;
      } else {
        // Distance is > 25km. Check if the user entered a valid Bidar delivery location:
        const lower = full.toLowerCase();
        const hasBidar = lower.includes('bidar') || [
          'gunj', 'naubad', 'shivnagar', 'gumpa', 'mailoor', 'fort',
          'chidri', 'halladkeri', 'manhalli', 'taleem', 'udgir', 'gandhi gunj'
        ].some(k => lower.includes(k));
        if (hasBidar) {
          this.isOutsideBidar.set(false);
        } else {
          this.isOutsideBidar.set(true);
        }
        return;
      }
    }

    // No GPS fetched or GPS was denied: user is entering manual address in Bidar
    this.isOutsideBidar.set(false);
  }

  calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  fetchCurrentLocation(showToast: boolean = true): void {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      this.locationError.set('Geolocation is not supported by your browser.');
      if (showToast) {
        this.toastService.show('Geolocation is not supported. Please enter your Bidar address manually.', 'info');
      }
      return;
    }

    this.isLocating.set(true);
    this.locationError.set(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude.toFixed(6));
        const lng = Number(position.coords.longitude.toFixed(6));
        this.userLocation.set({ lat, lng });
        this.platformService.userCoordinates.set({ lat, lng });

        // Calculate distance from TBZB Kitchen in Bidar
        const distance = this.calculateDistanceKm(
          this.config.location.latitude,
          this.config.location.longitude,
          lat,
          lng
        );
        const roundedDist = Number(distance.toFixed(1));
        this.userDistanceKm.set(roundedDist);
        this.isLocating.set(false);

        if (distance <= this.config.location.maxDeliveryRadiusKm) {
          this.isOutsideBidar.set(false);
          if (showToast) {
            this.toastService.show(
              `Live Bidar location verified (${roundedDist} km from TBZB kitchen)! 📍`,
              'success'
            );
          }
        } else {
          this.recheckAddressValidity();
          if (this.isOutsideBidar()) {
            this.toastService.show(
              `Delivery Unavailable: Your GPS is ${roundedDist} km away. We only deliver within Bidar.`,
              'error'
            );
          } else {
            this.toastService.show(
              `GPS coordinates attached (${roundedDist} km). Food will be delivered to your Bidar address.`,
              'info'
            );
          }
        }
      },
      (error) => {
        this.isLocating.set(false);
        let errorMsg = 'Could not fetch your GPS location.';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'Location permission was not granted. Using your manual Bidar address.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = 'Location signal unavailable. Using manual Bidar address.';
        } else if (error.code === error.TIMEOUT) {
          errorMsg = 'Location request timed out. Using manual Bidar address.';
        }
        this.locationError.set(errorMsg);

        // Do not block the user with a false alarm if address is in Bidar
        this.recheckAddressValidity();

        if (showToast && error.code !== error.PERMISSION_DENIED) {
          this.toastService.show(errorMsg, 'info');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 15000
      }
    );
  }

  close(): void {
    this.cartService.closeCheckout();
  }

  onRequireLogin(): void {
    this.toastService.show(
      'Please sign in or create an account to place your order.',
      'warning',
      'Login Required'
    );
    this.cartService.closeCheckout();
    this.authService.isAuthModalOpen.set(true);
  }

  onSubmitOrder(): void {
    if (!this.authService.isLoggedIn()) {
      this.onRequireLogin();
      return;
    }

    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      this.toastService.show('Please fill in all required fields accurately.', 'error');
      return;
    }

    if (this.cartService.isCartEmpty()) {
      this.toastService.show('Your cart is empty.', 'error');
      return;
    }

    if (!this.status().isOpen) {
      this.toastService.show('The kitchen is currently closed. Operating hours are 10:00 AM – 1:00 AM.', 'error');
      return;
    }

    const formValues = this.checkoutForm.value;

    // Check if entered address explicitly points outside Bidar (e.g. Hyderabad, Bengaluru, etc.)
    const fullAddress = `${formValues.flatNumber || ''} ${formValues.areaLocality || ''} ${formValues.landmark || ''}`;
    if (this.isForbiddenOutsideCity(fullAddress) || this.isOutsideBidar()) {
      this.toastService.show(
        `Cannot place delivery order: Delivery is strictly limited to Bidar city limits.`,
        'error',
        'Outside Delivery Area'
      );
      return;
    }

    this.isSubmitting = true;

    const calc = this.calculation();
    const items = this.cartService.items();
    const coords = this.userLocation();

    // Delivery & GPS Location Section
    let googleMapsUrl = '';
    if (coords) {
      googleMapsUrl = `https://maps.google.com/?q=${coords.lat},${coords.lng}`;
    }

    const orderId = 'TBZB-' + Date.now().toString().slice(-6);

    // Save order into Live Kitchen Admin Portal & Partner App (Firebase Firestore + Local Storage)
    const kitchenOrder: KitchenOrder = {
      orderId,
      createdAt: new Date().toISOString(),
      customerName: formValues.fullName,
      mobileNumber: formValues.mobileNumber,
      flatNumber: formValues.flatNumber,
      areaLocality: formValues.areaLocality,
      landmark: formValues.landmark || '',
      googleMapsUrl: googleMapsUrl || '',
      paymentMethod: formValues.paymentMethod,
      upiTransactionId: formValues.upiTransactionId || '',
      items: items.map(ci => ({
        dishId: ci.menuItem.id,
        name: ci.menuItem.name,
        price: ci.menuItem.price,
        quantity: ci.quantity,
        total: ci.menuItem.price * ci.quantity
      })),
      subtotal: calc.subtotal,
      deliveryCharge: calc.deliveryCharge ?? (calc.isAfterMidnight ? 60 : 50),
      total: calc.total,
      status: 'new'
    };

    // 1. Submit directly to Firestore tbzb_orders
    this.orderService.createOrder(kitchenOrder);

    // 2. Set as active customer order for in-app tracking
    this.platformService.setCustomerOrder(kitchenOrder);

    // 3. If customer is logged in, auto-save / update their Bidar delivery address on profile
    if (this.authService.isLoggedIn() && formValues.areaLocality) {
      this.authService.updateSavedAddress(formValues.areaLocality);
    }

    // 4. Clear the cart
    this.cartService.clearCart();

    // 5. Close the checkout modal
    this.cartService.closeCheckout();

    // 6. Navigate directly to in-app Orders Live Tracking tab
    this.platformService.activeTab.set('orders');

    // 7. Show confirmation notification
    this.toastService.show(
      `Order #${orderId} confirmed! Sent to TBZB kitchen for preparation.`,
      'success',
      'Order Placed'
    );

    this.isSubmitting = false;
  }
}
