import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuService } from '../../core/services/menu.service';
import { FoodCardComponent } from '../food-card/food-card.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { DietType } from '../../core/models/menu.model';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule, FoodCardComponent, IconComponent],
  template: `
    <section id="menu" class="menu-section">
      <div class="container">
        <!-- Section Header -->
        <div class="menu-header">
          <div class="title-area">
            <div class="menu-kicker-row">
              <span class="menu-sublabel">FRESHLY PREPARED</span>
              <span class="gold-dash" aria-hidden="true"></span>
            </div>
            <h2 class="menu-main-title">
              Explore Our
              <span class="title-accent-wrap">
                Full Menu
                <svg class="gold-swoosh" viewBox="0 0 200 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M4 10C55 2 145 2 196 8" stroke="#E5A00D" stroke-width="4.5" stroke-linecap="round"/>
                </svg>
              </span>
            </h2>
            <p class="menu-lead">
              From comforting street-style rolls to royal biryani, explore all dishes prepared to order.
            </p>
          </div>

          <!-- Controls: Search & Diet Filters Bar -->
          <div class="filter-controls-bar">
            <!-- Search Input Box -->
            <div class="search-input-box">
              <app-icon name="search" [size]="18" class="search-icon" />
              <input
                type="text"
                placeholder="Search biryani, rolls, maggi, dosa..."
                [ngModel]="menuService.searchQuery()"
                (ngModelChange)="onSearchChange($event)"
                class="search-field"
                aria-label="Search menu items"
              />
              @if (menuService.searchQuery()) {
                <button
                  class="clear-search-btn"
                  (click)="clearSearch()"
                  aria-label="Clear search query"
                >
                  <app-icon name="x" [size]="14" />
                </button>
              }
            </div>

            <!-- Diet Filter Pills -->
            <div class="diet-filter-group" role="group" aria-label="Filter by dietary preference">
              <button
                class="diet-btn"
                [class.active]="menuService.selectedDiet() === 'all'"
                (click)="setDiet('all')"
              >
                All
              </button>
              <button
                class="diet-btn veg-filter"
                [class.active]="menuService.selectedDiet() === 'veg'"
                (click)="setDiet('veg')"
              >
                <span class="diet-indicator veg"></span>
                <span>Veg</span>
              </button>
              <button
                class="diet-btn nonveg-filter"
                [class.active]="menuService.selectedDiet() === 'non-veg'"
                (click)="setDiet('non-veg')"
              >
                <span class="diet-indicator non-veg"></span>
                <span>Non-Veg</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Results Counter & Active Filter Reset -->
        <div class="results-bar">
          <span class="results-count">
            Showing <strong class="count-num">{{ menuService.filteredItems().length }}</strong> items
          </span>

          @if (menuService.searchQuery() || menuService.selectedCategory() !== 'all' || menuService.selectedDiet() !== 'all') {
            <button class="reset-filters-btn" (click)="resetAllFilters()">
              <app-icon name="x" [size]="12" />
              <span>Reset Filters</span>
            </button>
          }
        </div>

        <!-- Food Card Grid -->
        @if (menuService.filteredItems().length > 0) {
          <div class="menu-grid">
            @for (item of menuService.filteredItems(); track item.id) {
              <app-food-card [item]="item" />
            }
          </div>
        } @else {
          <!-- Empty State -->
          <div class="empty-menu-state">
            <div class="empty-icon-box">
              <app-icon name="search" [size]="32" />
            </div>
            <h3>No matching dishes found</h3>
            <p>
              We couldn't find any dish matching your search or selected filter. Try searching for something else or reset filters.
            </p>
            <button class="btn-primary" (click)="resetAllFilters()">
              <span>View All Menu Items</span>
            </button>
          </div>
        }
      </div>
    </section>
  `,
  styles: [`
    .menu-section {
      padding: 3.5rem 0 5rem;
      background-color: #FAF7F2;
      border-top: 1px solid rgba(0, 0, 0, 0.05);
    }

    .menu-header {
      margin-bottom: 1.75rem;
      display: flex;
      flex-direction: column;
    }

    .title-area {
      display: flex;
      flex-direction: column;
    }

    .menu-kicker-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }

    .menu-sublabel {
      font-size: 11px;
      font-weight: 850;
      letter-spacing: 0.12em;
      color: #0F472B;
      text-transform: uppercase;
    }

    .gold-dash {
      display: inline-block;
      width: 34px;
      height: 3.5px;
      background-color: #E5A00D;
      border-radius: 2px;
    }

    .menu-main-title {
      font-family: var(--font-heading);
      font-size: clamp(2.1rem, 3.6vw, 2.75rem);
      font-weight: 850;
      color: #0F472B;
      letter-spacing: -0.025em;
      line-height: 1.15;
      margin-bottom: 6px;
    }

    .title-accent-wrap {
      position: relative;
      display: inline-block;
    }

    .gold-swoosh {
      position: absolute;
      bottom: -9px;
      left: 0;
      width: 100%;
      height: 14px;
      pointer-events: none;
    }

    .menu-lead {
      font-size: 14.5px;
      color: #4B5563;
      max-width: 620px;
      font-weight: 450;
      line-height: 1.5;
    }

    .filter-controls-bar {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 1.25rem;

      @media (min-width: 768px) {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        margin-top: 1.75rem;
      }
    }

    .search-input-box {
      position: relative;
      display: flex;
      align-items: center;
      background-color: #FFFFFF;
      border: 1.5px solid #E5E7EB;
      border-radius: 14px;
      padding: 0 14px;
      height: 44px;
      width: 100%;
      box-sizing: border-box;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      transition: all var(--transition-fast);

      @media (min-width: 768px) {
        max-width: 460px;
        height: 48px;
        padding: 0 18px;
      }

      &:focus-within {
        border-color: #0F472B;
        box-shadow: 0 0 0 3px rgba(15, 71, 43, 0.1);
      }
    }

    .search-icon {
      color: #0F472B;
      margin-right: 10px;
      flex-shrink: 0;
    }

    .search-field {
      width: 100%;
      height: 100%;
      background: transparent;
      border: none;
      outline: none;
      font-family: var(--font-body);
      font-size: 13.5px;
      font-weight: 500;
      color: #111827;

      &::placeholder {
        color: #9CA3AF;
        font-size: 12.5px;
      }
    }

    .clear-search-btn {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #F3F4F6;
      border: none;
      color: #6B7280;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      flex-shrink: 0;
      transition: all var(--transition-fast);

      &:hover {
        background: #E5E7EB;
        color: #111827;
      }
    }

    .diet-filter-group {
      display: inline-flex;
      align-items: center;
      background: #FFFFFF;
      padding: 4px;
      border-radius: 9999px;
      border: 1.5px solid #E5E7EB;
      gap: 4px;
      align-self: flex-start;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);

      @media (min-width: 768px) {
        align-self: center;
      }
    }

    .diet-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 7px 18px;
      border-radius: 9999px;
      font-family: var(--font-heading);
      font-size: 13.5px;
      font-weight: 650;
      color: #374151;
      transition: all var(--transition-fast);
      cursor: pointer;

      &:hover {
        color: #0F472B;
        background-color: #F9FAFB;
      }

      &.active {
        background-color: #0F472B;
        color: #FFFFFF;
        font-weight: 750;

        &:hover {
          background-color: #0A3520;
        }

        .diet-indicator.veg {
          border-color: #FFFFFF;
          &::after {
            background-color: #FFFFFF;
          }
        }

        .diet-indicator.non-veg {
          border-color: #FFFFFF;
          &::after {
            border-bottom-color: #FFFFFF;
          }
        }
      }
    }

    .results-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.5rem;
    }

    .results-count {
      font-size: 14px;
      color: #4B5563;

      .count-num {
        color: #111827;
        font-weight: 800;
      }
    }

    .reset-filters-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12.5px;
      font-weight: 650;
      color: #0F472B;
      cursor: pointer;
      padding: 4px 12px;
      border-radius: 9999px;
      background: rgba(15, 71, 43, 0.08);
      transition: background var(--transition-fast);

      &:hover {
        background: rgba(15, 71, 43, 0.15);
      }
    }

    .menu-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr)); /* 2 dishes per line on mobile */
      gap: 10px;

      @media (min-width: 640px) {
        grid-template-columns: repeat(2, 1fr);
        gap: 1.25rem;
      }
      @media (min-width: 1024px) {
        grid-template-columns: repeat(4, 1fr);
        gap: 1.5rem;
      }
    }

    .empty-menu-state {
      padding: 4rem 1rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      max-width: 440px;
      margin: 0 auto;

      .empty-icon-box {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background: #FFFFFF;
        border: 1.5px solid #E5E7EB;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #0F472B;
        margin-bottom: 1.25rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
      }

      h3 {
        font-family: var(--font-heading);
        font-size: 1.35rem;
        font-weight: 800;
        color: #0F472B;
        margin-bottom: 8px;
      }

      p {
        font-size: 14px;
        color: #4B5563;
        margin-bottom: 1.5rem;
        line-height: 1.5;
      }

      .btn-primary {
        background-color: #0F472B;
        color: #FFFFFF;
        padding: 10px 24px;
        border-radius: 9999px;
        font-family: var(--font-heading);
        font-weight: 700;
        font-size: 14px;
        transition: background-color var(--transition-fast);

        &:hover {
          background-color: #0A3520;
        }
      }
    }
  `]
})
export class MenuComponent {
  menuService = inject(MenuService);

  onSearchChange(val: string): void {
    this.menuService.setSearchQuery(val);
  }

  clearSearch(): void {
    this.menuService.setSearchQuery('');
  }

  setDiet(diet: 'all' | DietType): void {
    this.menuService.setDiet(diet);
  }

  resetAllFilters(): void {
    this.menuService.setCategory('all');
    this.menuService.setDiet('all');
    this.menuService.setSearchQuery('');
  }
}
