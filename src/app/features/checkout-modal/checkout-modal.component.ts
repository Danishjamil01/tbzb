import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { BusinessStatusService } from '../../core/services/business-status.service';
import { ToastService } from '../../core/services/toast.service';
import { InrPipe } from '../../shared/pipes/inr.pipe';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { PlacedOrder } from '../../core/models/order.model';

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
                    (click)="fetchCurrentLocation()"
                    [disabled]="isLocating()"
                  >
                    @if (isLocating()) {
                      <span class="spinner-dot"></span>
                      <span>Verifying Bidar Location...</span>
                    } @else {
                      <app-icon name="map-pin" [size]="15" />
                      <span>📍 Verify My Live Location in Bidar (Required)</span>
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
                <label
                  class="payment-tab"
                  [class.selected]="checkoutForm.get('paymentMethod')?.value === 'upi'"
                >
                  <input type="radio" formControlName="paymentMethod" value="upi" class="sr-only" />
                  <div class="tab-radio-circle">
                    @if (checkoutForm.get('paymentMethod')?.value === 'upi') {
                      <span class="inner-dot"></span>
                    }
                  </div>
                  <div class="tab-meta">
                    <strong>Online UPI (Scan QR)</strong>
                    <span>Google Pay, PhonePe, Paytm</span>
                  </div>
                </label>

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
                    <strong>Cash on Delivery (COD)</strong>
                    <span>Pay cash to delivery rider</span>
                  </div>
                </label>
              </div>

              <!-- Compact UPI QR Code Block (Only when UPI selected) -->
              @if (checkoutForm.get('paymentMethod')?.value === 'upi') {
                <div class="qr-compact-box">
                  <div class="qr-display-container">
                    <img
                      src="images/myqr.jpeg"
                      alt="The Bite Zone UPI QR Code"
                      class="qr-image"
                    />
                    <div class="qr-badge">The Bite Zone QR</div>
                  </div>

                  <div class="qr-content-pane">
                    <div class="qr-amount-pill">
                      Pay Exact Amount: <strong>{{ calculation().total | inr }}</strong>
                    </div>
                    <p class="qr-helper">
                      Scan with GPay, PhonePe, or Paytm and send payment screenshot on WhatsApp.
                    </p>
                    <div class="utr-wrap">
                      <label for="upiTxnId">UTR / UPI Ref No. <span class="opt">(Optional)</span></label>
                      <input
                        id="upiTxnId"
                        type="text"
                        formControlName="upiTransactionId"
                        placeholder="e.g. 12-digit transaction ID"
                        class="form-control"
                      />
                    </div>
                  </div>
                </div>
              }
            </div>

            <!-- 4. Total & Submit on WhatsApp -->
            <div class="checkout-footer-card">
              <div class="total-row">
                <div class="total-text-col">
                  <span class="total-title">Total Payable</span>
                  @if (calculation().isAfterMidnight) {
                    <span class="fee-note">₹70 late-night delivery included</span>
                  } @else if (calculation().hasPendingDeliveryFee) {
                    <span class="fee-note">Delivery charge confirmed on WhatsApp</span>
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
              } @else if (!userLocation()) {
                <button
                  type="button"
                  class="btn-submit btn-verify-prompt"
                  (click)="fetchCurrentLocation()"
                  [disabled]="isLocating()"
                >
                  @if (isLocating()) {
                    <span class="spinner-dot"></span>
                    <span>Verifying Bidar Location...</span>
                  } @else {
                    <app-icon name="map-pin" [size]="18" />
                    <span>📍 Verify Bidar Location to Order</span>
                  }
                </button>
              } @else {
                <button
                  type="submit"
                  class="btn-submit"
                  [disabled]="isSubmitting"
                >
                  <app-icon name="whatsapp" [size]="20" />
                  <span>Place Order on WhatsApp • {{ calculation().total | inr }}</span>
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
      padding: 12px 18px;
      font-size: 14.5px;
      font-weight: 700;
      border-radius: 12px;
      background: #25D366;
      color: #FFFFFF;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      cursor: pointer;
      box-shadow: 0 3px 12px rgba(37, 211, 102, 0.3);
      transition: all 0.2s ease;

      &:hover:not(:disabled) {
        background: #1EBE5D;
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
    }
  `]
})
export class CheckoutModalComponent {
  private fb = inject(FormBuilder);
  cartService = inject(CartService);
  private statusService = inject(BusinessStatusService);
  private toastService = inject(ToastService);

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
    paymentMethod: ['upi', Validators.required],
    upiTransactionId: ['']
  });

  isFieldInvalid(fieldName: string): boolean {
    const field = this.checkoutForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
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

  fetchCurrentLocation(): void {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      this.locationError.set('Geolocation is not supported by your browser.');
      this.toastService.show('Geolocation is not supported by your browser.', 'error');
      return;
    }

    this.isLocating.set(true);
    this.locationError.set(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude.toFixed(6));
        const lng = Number(position.coords.longitude.toFixed(6));
        this.userLocation.set({ lat, lng });

        // Calculate distance from TBZB Kitchen in Bidar
        const distance = this.calculateDistanceKm(
          this.config.location.latitude,
          this.config.location.longitude,
          lat,
          lng
        );
        const roundedDist = Number(distance.toFixed(1));
        this.userDistanceKm.set(roundedDist);

        if (distance > this.config.location.maxDeliveryRadiusKm) {
          this.isOutsideBidar.set(true);
          this.isLocating.set(false);
          this.toastService.show(
            `Delivery Unavailable: Your location is ${roundedDist} km away. We only deliver within Bidar.`,
            'error'
          );
        } else {
          this.isOutsideBidar.set(false);
          this.isLocating.set(false);
          this.toastService.show(
            `Live Bidar location verified (${roundedDist} km from TBZB kitchen)! 📍`,
            'success'
          );
        }
      },
      (error) => {
        this.isLocating.set(false);
        let errorMsg = 'Could not fetch your location.';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'Location permission was denied. Please enter your Bidar address manually.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = 'Location information is currently unavailable.';
        } else if (error.code === error.TIMEOUT) {
          errorMsg = 'Location request timed out. Please try again.';
        }
        this.locationError.set(errorMsg);
        this.toastService.show(errorMsg, 'error');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }

  close(): void {
    this.cartService.closeCheckout();
  }

  onSubmitOrder(): void {
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

    // Strict Geofence check: Customer outside Bidar cannot order delivery!
    if (this.isOutsideBidar()) {
      this.toastService.show(
        `Cannot place delivery order: Your location is ${this.userDistanceKm()} km outside Bidar. Delivery is strictly limited to Bidar city limits.`,
        'error'
      );
      return;
    }

    // Mandatory Location Check: Customer must verify location in Bidar
    if (!this.userLocation()) {
      this.toastService.show(
        'Please verify your live location in Bidar to place the order 📍',
        'error'
      );
      this.fetchCurrentLocation();
      return;
    }

    this.isSubmitting = true;

    const calc = this.calculation();
    const items = this.cartService.items();
    const coords = this.userLocation();

    // Format individual order lines
    const orderLines = items.map(
      ci => `• ${ci.quantity} × ${ci.menuItem.name} – ₹${ci.menuItem.price * ci.quantity}`
    ).join('\n');

    // Delivery & GPS Location Section
    let locationSection = '';
    let googleMapsUrl = '';

    if (coords) {
      googleMapsUrl = `https://maps.google.com/?q=${coords.lat},${coords.lng}`;
      locationSection = `🗺️ *Customer Live GPS:* ${googleMapsUrl}${this.userDistanceKm() !== null ? ' (' + this.userDistanceKm() + ' km from TBZB kitchen)' : ''}\n`;
    }

    const addressSection = `📍 *Delivery Address:*\n${formValues.flatNumber}, ${formValues.areaLocality}${formValues.landmark ? ' (Landmark: ' + formValues.landmark + ')' : ''}, Bidar\n${locationSection}`;

    // Payment Section
    let paymentSection = '';
    if (formValues.paymentMethod === 'upi') {
      paymentSection = `💳 *Payment Mode:* Online UPI Payment (QR Code Scanned)\n`;
      if (formValues.upiTransactionId?.trim()) {
        paymentSection += `🔢 *UPI / UTR Ref:* ${formValues.upiTransactionId.trim()}\n`;
      }
      paymentSection += `📸 *Payment Screenshot:* (Will send screenshot here)\n`;
    } else {
      paymentSection = `💳 *Payment Mode:* Cash on Delivery (COD)\n`;
    }

    // Delivery Fee Line
    let deliveryLine = '';
    if (calc.isAfterMidnight) {
      deliveryLine = `🛵 *Delivery Charge:* ₹70 (Late-night rate after midnight)\n`;
    } else if (calc.deliveryCharge !== null) {
      deliveryLine = `🛵 *Delivery Charge:* ₹${calc.deliveryCharge}\n`;
    } else {
      deliveryLine = `🛵 *Delivery Charge:* Awaiting confirmation on WhatsApp\n`;
    }

    // Kitchen link
    const kitchenMapLine = `📍 *Kitchen Location:* ${this.config.location.mapUrl}\n`;

    // Clean, direct WhatsApp Message
    const messageText = `🍽️ *NEW FOOD ORDER – THE BITE ZONE (TBZB)*
================================
👤 *Customer:* ${formValues.fullName}
📞 *Mobile:* +91 ${formValues.mobileNumber}
${addressSection}${kitchenMapLine}
🍱 *Order Items:*
${orderLines}

================================
💰 *Item Subtotal:* ₹${calc.subtotal}
${deliveryLine}🧾 *Total Payable:* ₹${calc.total}
${paymentSection}================================
_Order placed via TBZB Online Website • Delivery strictly within Bidar_`;

    const whatsAppUrl = `https://wa.me/${this.config.contact.whatsappNumber}?text=${encodeURIComponent(messageText)}`;

    const orderRecord: PlacedOrder = {
      orderId: 'TBZB-' + Date.now().toString().slice(-6),
      timestamp: new Date(),
      customer: {
        ...formValues,
        orderType: 'delivery',
        locationCoordinates: coords ?? undefined,
        googleMapsUrl: googleMapsUrl || undefined
      },
      items: [...items],
      calculation: calc,
      formattedWhatsAppMessage: messageText,
      whatsAppUrl
    };

    // Open WhatsApp
    window.open(whatsAppUrl, '_blank', 'noopener,noreferrer');

    // Save order record into window object and trigger confirmation modal
    this.cartService.closeCheckout();
    this.cartService.isOrderConfirmedModalOpen.set(true);
    (window as any).__lastTbzbOrder = orderRecord;

    this.isSubmitting = false;
  }
}
