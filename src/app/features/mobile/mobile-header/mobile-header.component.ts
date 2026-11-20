import { Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { PlatformService } from '../../../core/services/platform.service';
import { BusinessStatusService } from '../../../core/services/business-status.service';
import { MenuService } from '../../../core/services/menu.service';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-mobile-header',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <header class="mobile-header">
      <!-- Top Delivery & Info Row -->
      <div class="top-row">
        <!-- Location details -->
        <div class="location-box" (click)="openHoursModal.emit()">
          <div class="pin-icon-wrap">
            <app-icon name="map-pin" [size]="18" />
          </div>
          <div class="location-text">
            <div class="loc-headline">
              <span class="city-title">Bidar, Karnataka</span>
              <app-icon name="chevron-down" [size]="14" />
            </div>
            <span class="loc-sub">Doorstep Delivery • 15-25 Mins</span>
          </div>
        </div>

        <!-- Right Quick Actions -->
        <div class="header-actions">
          <!-- Kitchen Status Pill -->
          <div class="status-pill" [class.open]="status().isOpen" (click)="openHoursModal.emit()">
            <span class="dot"></span>
            <span class="status-label">{{ status().isOpen ? 'Open' : 'Closed' }}</span>
          </div>

          <!-- Website Switcher Button -->
          <button
            class="action-btn web-toggle-btn"
            (click)="platformService.toggleViewMode()"
            title="Switch to Website View"
            aria-label="Switch to Website View"
          >
            <span class="toggle-text">Web View</span>
          </button>

          <!-- Admin Quick Key -->
          <button
            class="action-btn admin-btn"
            (click)="onAdminClick()"
            title="Kitchen Admin"
            aria-label="Kitchen Admin"
          >
            <app-icon name="lock" [size]="16" />
          </button>
        </div>
      </div>

      <!-- Quick Search Bar -->
      <div class="search-row">
        <div class="search-input-wrap">
          <app-icon name="search" [size]="18" extraClass="search-icon" />
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearchChange($event)"
            placeholder="Search Rolls, Biryani, Starters, Drinks..."
            class="search-input"
            aria-label="Search Dishes"
          />
          @if (searchQuery) {
            <button class="clear-btn" (click)="clearSearch()" aria-label="Clear Search">
              <app-icon name="x" [size]="14" />
            </button>
          }
        </div>
      </div>
    </header>
  `,
  styles: [`
    .mobile-header {
      position: sticky;
      top: 0;
      left: 0;
      right: 0;
      background: #0B2F1D;
      background: linear-gradient(180deg, #092819 0%, #0D3B24 100%);
      color: #FFFFFF;
      padding: 10px 14px 12px;
      z-index: 100;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      border-bottom: 1px solid rgba(245, 158, 11, 0.2);
    }

    .top-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      margin-bottom: 10px;
    }

    .location-box {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      user-select: none;
      flex: 1;
      min-width: 0;
    }

    .pin-icon-wrap {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.35);
      color: #F59E0B;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .location-text {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .loc-headline {
      display: flex;
      align-items: center;
      gap: 4px;

      .city-title {
        font-size: 13.5px;
        font-weight: 700;
        color: #FFFFFF;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      app-icon {
        color: #FBBF24;
      }
    }

    .loc-sub {
      font-size: 10.5px;
      color: #A7F3D0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      letter-spacing: 0.2px;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }

    .status-pill {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 4px 8px;
      background: rgba(239, 68, 68, 0.2);
      border: 1px solid rgba(239, 68, 68, 0.4);
      border-radius: 12px;
      font-size: 10px;
      font-weight: 700;
      color: #FCA5A5;
      cursor: pointer;

      .dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #EF4444;
      }

      &.open {
        background: rgba(16, 185, 129, 0.2);
        border-color: rgba(16, 185, 129, 0.4);
        color: #A7F3D0;

        .dot {
          background: #10B981;
          box-shadow: 0 0 6px #10B981;
        }
      }
    }

    .action-btn {
      height: 30px;
      border-radius: 15px;
      border: 1px solid rgba(255, 255, 255, 0.15);
      background: rgba(255, 255, 255, 0.08);
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.15s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.16);
      }
    }

    .web-toggle-btn {
      padding: 0 9px;
      font-size: 10.5px;
      font-weight: 600;
      color: #FDE68A;
      border-color: rgba(245, 158, 11, 0.3);
    }

    .admin-btn {
      width: 30px;
      color: #D1D5DB;
    }

    /* Search Bar Row */
    .search-row {
      width: 100%;
    }

    .search-input-wrap {
      display: flex;
      align-items: center;
      background: #FFFFFF;
      border-radius: 12px;
      padding: 0 12px;
      height: 40px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
      gap: 8px;

      :deep(.search-icon) {
        color: #9CA3AF;
        flex-shrink: 0;
      }
    }

    .search-input {
      flex: 1;
      border: none;
      outline: none;
      font-size: 13px;
      color: #111827;
      background: transparent;

      &::placeholder {
        color: #9CA3AF;
        font-size: 12px;
      }
    }

    .clear-btn {
      border: none;
      background: #E5E7EB;
      color: #4B5563;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
  `]
})
export class MobileHeaderComponent {
  platformService = inject(PlatformService);
  private statusService = inject(BusinessStatusService);
  private menuService = inject(MenuService);
  private adminService = inject(AdminService);

  @Output() openHoursModal = new EventEmitter<void>();

  status = this.statusService.status;
  searchQuery: string = '';

  onSearchChange(val: string): void {
    this.menuService.searchQuery.set(val);
    if (val && this.platformService.activeTab() !== 'menu') {
      this.platformService.setTab('menu');
    }
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.menuService.searchQuery.set('');
  }

  onAdminClick(): void {
    this.adminService.openAdmin();
  }
}
