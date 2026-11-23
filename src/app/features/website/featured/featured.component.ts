import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuService } from '../../../core/services/menu.service';
import { FoodCardComponent } from '../../food-card/food-card.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-featured',
  standalone: true,
  imports: [CommonModule, FoodCardComponent, IconComponent],
  template: `
    <section id="featured" class="featured-section">
      <div class="container">
        <!-- Section Header -->
        <div class="section-header">
          <div class="section-title-wrap">
            <div class="section-kicker-row">
              <span class="gold-dash" aria-hidden="true"></span>
            </div>
            <div class="title-action-row">
              <h2 class="section-title">Popular Dishes</h2>
              <button type="button" class="view-all-link" (click)="menuService.openAllDishes()" aria-label="View all dishes">
                <span>View All</span>
                <span class="view-arrow">→</span>
              </button>
            </div>
          </div>

          <!-- Right Chef Note -->
          <div class="header-note-wrap">
            <div class="header-divider" aria-hidden="true"></div>
            <div class="chef-note">
              <app-icon name="chef-hat" [size]="24" class="chef-icon" />
              <p class="section-subtitle">
                Most loved and ordered by food enthusiasts across Bidar.
              </p>
            </div>
          </div>
        </div>

        <!-- Featured Delicacies Grid (4 items in a row) -->
        <div class="featured-grid">
          @for (item of menuService.featuredItems(); track item.id) {
            <app-food-card [item]="item" />
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    .featured-section {
      padding: 2rem 0 3rem;
      background-color: #FAF7F2;
      border-top: 1px solid rgba(0, 0, 0, 0.04);
      border-bottom: 1px solid rgba(0, 0, 0, 0.04);

      @media (min-width: 768px) {
        padding: 3rem 0 3.5rem;
      }
    }

    .section-header {
      margin-bottom: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;

      @media (min-width: 768px) {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 2.25rem;
      }
    }

    .section-title-wrap {
      display: flex;
      flex-direction: column;
      width: 100%;
    }

    .section-kicker-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    }

    .gold-dash {
      display: inline-block;
      width: 28px;
      height: 3.5px;
      background-color: #FFC82C;
      border-radius: 2px;
    }

    .title-action-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    }

    .section-title {
      font-family: var(--font-heading);
      font-size: clamp(1.45rem, 3.4vw, 2.3rem);
      font-weight: 850;
      color: #0F472B;
      letter-spacing: -0.02em;
      line-height: 1.15;
      margin: 0;
    }

    .view-all-link {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      color: #0F472B;
      font-family: var(--font-heading);
      font-size: 13.5px;
      font-weight: 700;
      text-decoration: none;
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
      transition: all var(--transition-fast);

      .view-arrow {
        font-size: 15px;
        transition: transform var(--transition-fast);
      }

      &:hover {
        color: #0A3520;
        .view-arrow {
          transform: translateX(3px);
        }
      }
    }

    .header-note-wrap {
      display: none;
      align-items: center;
      gap: 1.25rem;

      @media (min-width: 768px) {
        display: flex;
      }
    }

    .header-divider {
      width: 1px;
      height: 34px;
      background-color: #E5E7EB;
    }

    .chef-note {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .chef-icon {
      color: #0F472B;
      flex-shrink: 0;
    }

    .section-subtitle {
      font-size: 13.5px;
      color: #4B5563;
      max-width: 340px;
      line-height: 1.45;
      font-weight: 500;
      margin: 0;
    }

    .featured-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.25rem;

      @media (max-width: 767px) {
        display: flex;
        overflow-x: auto;
        scroll-snap-type: x mandatory;
        gap: 12px;
        padding: 4px 4px 14px;
        margin: 0 -12px;
        padding-left: 12px;
        padding-right: 12px;
        scrollbar-width: none;
        -webkit-overflow-scrolling: touch;

        &::-webkit-scrollbar {
          display: none;
        }

        app-food-card {
          flex: 0 0 240px;
          max-width: 76vw;
          scroll-snap-align: start;
        }
      }

      @media (min-width: 768px) and (max-width: 1023px) {
        grid-template-columns: repeat(2, 1fr);
      }

      @media (min-width: 1024px) {
        grid-template-columns: repeat(4, 1fr);
        gap: 1.5rem;
      }
    }
  `]
})
export class FeaturedComponent {
  menuService = inject(MenuService);
}
