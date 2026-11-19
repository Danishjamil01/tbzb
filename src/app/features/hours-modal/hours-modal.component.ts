import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BusinessStatusService } from '../../core/services/business-status.service';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-hours-modal',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    @if (isOpen()) {
      <div class="modal-backdrop" (click)="close()"></div>

      <div class="hours-modal-dialog" role="dialog" aria-modal="true" aria-label="Kitchen Timings and Delivery Charges">
        <div class="modal-header">
          <div class="header-title-box">
            <app-icon name="clock" [size]="20" />
            <h3>Operating Hours & Delivery Policy</h3>
          </div>
          <button class="btn-close" (click)="close()" aria-label="Close modal">
            <app-icon name="x" [size]="20" />
          </button>
        </div>

        <div class="modal-body">
          <!-- Current Live Status -->
          <div class="live-status-card" [ngClass]="status().isOpen ? 'open' : 'closed'">
            <div class="status-indicator-row">
              <span class="dot"></span>
              <h4>{{ status().isOpen ? 'Kitchen is Currently OPEN' : 'Kitchen is Currently CLOSED' }}</h4>
            </div>
            <p class="status-desc">
              @if (status().isOpen) {
                We are actively accepting food orders.
                @if (status().isAfterMidnight) {
                  <strong> You are in our late-night operating window (open till 1:00 AM).</strong>
                } @else {
                  Open today until 1:00 AM (midnight delivery available).
                }
              } @else {
                Our kitchen opens daily at 10:00 AM. You can explore the menu and prepare your cart in advance.
              }
            </p>
          </div>

          <!-- Schedule Table -->
          <div class="info-block">
            <h5 class="block-title">Daily Kitchen Schedule</h5>
            <div class="schedule-grid">
              <div class="schedule-row">
                <span class="label">Opening Time</span>
                <span class="val highlight">10:00 AM</span>
              </div>
              <div class="schedule-row">
                <span class="label">Closing Time</span>
                <span class="val highlight">1:00 AM (Past Midnight)</span>
              </div>
              <div class="schedule-row">
                <span class="label">Operating Days</span>
                <span class="val">Monday through Sunday (All 7 Days)</span>
              </div>
            </div>
          </div>

          <!-- Delivery Charge Transparency -->
          <div class="info-block">
            <h5 class="block-title">Delivery Charge Policy</h5>
            <div class="policy-cards">
              <div class="policy-card midnight">
                <div class="policy-header">
                  <app-icon name="moon" [size]="16" />
                  <strong>After Midnight (12:00 AM – 1:00 AM)</strong>
                </div>
                <div class="policy-price">₹70 Late-Night Fee</div>
                <p>Standard delivery charge of ₹70 is applied to all midnight deliveries inside Bidar.</p>
              </div>

              <div class="policy-card standard">
                <div class="policy-header">
                  <app-icon name="sun" [size]="16" />
                  <strong>Before Midnight (10:00 AM – 11:59 PM)</strong>
                </div>
                <div class="policy-price pending">Confirmed on WhatsApp</div>
                <p>Daytime delivery charge is confirmed directly by the restaurant based on your exact locality in Bidar.</p>
              </div>
            </div>
          </div>

          <!-- Time Simulator for Testing & Quality Verification -->
          <div class="simulator-box">
            <div class="sim-header" (click)="toggleSimulator()">
              <app-icon name="sparkles" [size]="14" />
              <span>Preview / Test Hours Mode</span>
              <app-icon [name]="showSimulator() ? 'chevron-down' : 'chevron-right'" [size]="14" />
            </div>

            @if (showSimulator()) {
              <div class="sim-content">
                <p class="sim-desc">
                  Select a test time to verify how the website and delivery fee adapt across operating windows:
                </p>
                <div class="sim-buttons">
                  <button class="sim-btn" (click)="simulate(9, 0)">
                    9:00 AM (Closed)
                  </button>
                  <button class="sim-btn" (click)="simulate(14, 0)">
                    2:00 PM (Open / Pre-Midnight)
                  </button>
                  <button class="sim-btn" (click)="simulate(0, 30)">
                    12:30 AM (Open / ₹70 Midnight Fee)
                  </button>
                  <button class="sim-btn" (click)="simulate(2, 0)">
                    2:00 AM (Closed)
                  </button>
                  <button class="sim-btn reset" (click)="resetSimulation()">
                    Reset to Real Clock
                  </button>
                </div>
                @if (isSimulated()) {
                  <div class="sim-active-note">
                    * Simulating: {{ status().currentTimeString }}
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(5px);
      z-index: 1060;
    }

    .hours-modal-dialog {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 90%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
      background-color: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      z-index: 1061;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.9);
      animation: modalPop 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes modalPop {
      from { opacity: 0; transform: translate(-50%, -46%) scale(0.96); }
      to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    }

    .modal-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
      background-color: var(--bg-surface);
    }

    .header-title-box {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #fff;

      h3 {
        font-size: 1.15rem;
      }
    }

    .btn-close {
      color: var(--text-secondary);
      padding: 4px;

      &:hover {
        color: #fff;
      }
    }

    .modal-body {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .live-status-card {
      padding: 14px;
      border-radius: var(--radius-md);
      display: flex;
      flex-direction: column;
      gap: 6px;

      &.open {
        background: rgba(34, 197, 94, 0.08);
        border: 1px solid rgba(34, 197, 94, 0.25);
        color: var(--status-open);
        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--status-open);
          box-shadow: 0 0 8px var(--status-open);
        }
      }

      &.closed {
        background: rgba(239, 68, 68, 0.08);
        border: 1px solid rgba(239, 68, 68, 0.25);
        color: var(--status-closed);
        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--status-closed);
        }
      }
    }

    .status-indicator-row {
      display: flex;
      align-items: center;
      gap: 8px;

      h4 {
        font-size: 14px;
        color: inherit;
      }
    }

    .status-desc {
      font-size: 13px;
      color: var(--text-secondary);
      line-height: 1.45;
    }

    .block-title {
      font-size: 13px;
      font-weight: 700;
      color: #fff;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 10px;
    }

    .schedule-grid {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .schedule-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 13.5px;

      .label {
        color: var(--text-secondary);
      }
      .val {
        font-weight: 600;
        color: #fff;

        &.highlight {
          color: var(--accent-primary);
        }
      }
    }

    .policy-cards {
      display: grid;
      grid-template-columns: 1fr;
      gap: 10px;
    }

    .policy-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;

      .policy-header {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: var(--text-secondary);
      }

      .policy-price {
        font-family: var(--font-heading);
        font-size: 15px;
        font-weight: 800;
        color: var(--accent-primary);

        &.pending {
          color: var(--accent-secondary);
          font-size: 13.5px;
        }
      }

      p {
        font-size: 12px;
        color: var(--text-muted);
        line-height: 1.4;
      }

      &.midnight {
        border-color: rgba(244, 180, 0, 0.25);
        background: rgba(244, 180, 0, 0.04);
      }
    }

    .simulator-box {
      border: 1px dashed var(--border-color);
      border-radius: var(--radius-md);
      overflow: hidden;
    }

    .sim-header {
      padding: 10px 14px;
      background: var(--bg-surface);
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      font-size: 12.5px;
      font-weight: 600;
      color: var(--text-secondary);

      &:hover {
        color: #fff;
      }
    }

    .sim-content {
      padding: 12px 14px;
      background: rgba(0, 0, 0, 0.2);
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .sim-desc {
      font-size: 12px;
      color: var(--text-muted);
    }

    .sim-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .sim-btn {
      padding: 6px 10px;
      font-size: 11.5px;
      font-weight: 600;
      border-radius: var(--radius-sm);
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.15s;

      &:hover {
        background: var(--bg-surface-elevated);
        color: #fff;
      }

      &.reset {
        border-color: var(--accent-primary);
        color: var(--accent-primary);
      }
    }

    .sim-active-note {
      font-size: 11.5px;
      color: var(--accent-primary);
      font-weight: 600;
    }
  `]
})
export class HoursModalComponent {
  private statusService = inject(BusinessStatusService);

  isOpen = signal<boolean>(false);
  showSimulator = signal<boolean>(false);

  status = this.statusService.status;
  config = this.statusService.config;

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }

  toggleSimulator(): void {
    this.showSimulator.update(v => !v);
  }

  simulate(hour: number, minute: number): void {
    this.statusService.setSimulatedTime(hour, minute);
  }

  resetSimulation(): void {
    this.statusService.resetSimulatedTime();
  }

  isSimulated(): boolean {
    return this.statusService.isSimulated();
  }
}

