import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuService } from '../../core/services/menu.service';
import { FoodCategory } from '../../core/models/menu.model';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-category-nav',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="category-nav-wrapper">
      <div class="container">
        <div class="category-grid-container">
          @for (cat of menuService.categories; track cat.id) {
            <button
              class="category-pill"
              [class.active]="menuService.selectedCategory() === cat.id"
              (click)="onSelectCategory(cat.id)"
              [attr.aria-pressed]="menuService.selectedCategory() === cat.id"
            >
              <div class="cat-icon-wrap">
                <app-icon [name]="cat.icon" [size]="14" />
              </div>
              <span class="cat-label">{{ cat.label }}</span>
              <span class="cat-count">
                {{ menuService.categoryCounts()[cat.id] }}
              </span>
            </button>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      position: sticky;
      top: var(--header-height);
      z-index: 90;
      width: 100%;
    }

    .category-nav-wrapper {
      background-color: #FAF7F2;
      padding: 0.65rem 0 0.85rem;
      border-bottom: 1px solid rgba(0, 0, 0, 0.04);
      transition: background-color 0.2s ease, box-shadow 0.2s ease;
      width: 100%;
      overflow-x: hidden;
    }

    /* 2 Rows of 3 Pills on Mobile, Flex on Desktop */
    .category-grid-container {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 5px;
      width: 100%;
      box-sizing: border-box;

      @media (min-width: 768px) {
        display: flex;
        align-items: center;
        gap: 12px;
        overflow-x: auto;
        scrollbar-width: none;
        -ms-overflow-style: none;

        &::-webkit-scrollbar {
          display: none;
        }
      }
    }

    .category-pill {
      min-width: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 6.5px 4px;
      border-radius: 9999px;
      background-color: #FFFFFF;
      color: #1F2937;
      border: 1.5px solid #E5E7EB;
      font-family: var(--font-heading);
      font-size: 10.5px;
      font-weight: 650;
      white-space: nowrap;
      transition: all var(--transition-fast);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
      cursor: pointer;
      width: 100%;
      box-sizing: border-box;

      @media (min-width: 768px) {
        width: auto;
        padding: 8px 18px;
        font-size: 13.5px;
        gap: 9px;
        flex-shrink: 0;
      }

      &:hover {
        border-color: #D1D5DB;
        background-color: #F9FAFB;
      }

      &.active {
        background-color: #0F472B;
        color: #FFFFFF;
        border-color: #0F472B;
        box-shadow: 0 3px 10px rgba(15, 71, 43, 0.25);

        .cat-icon-wrap {
          color: #FFFFFF;
        }

        .cat-count {
          background-color: #FFFFFF;
          color: #0F472B;
          font-weight: 800;
        }
      }
    }

    .cat-icon-wrap {
      display: flex;
      align-items: center;
      color: #374151;
      transition: color var(--transition-fast);
      flex-shrink: 0;
    }

    .cat-label {
      line-height: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .cat-count {
      font-size: 9.5px;
      padding: 1.5px 5px;
      border-radius: 9999px;
      background-color: #F3F4F6;
      color: #4B5563;
      font-weight: 700;
      line-height: 1;
      flex-shrink: 0;

      @media (min-width: 768px) {
        font-size: 11px;
        padding: 2px 7px;
      }
    }
  `]
})
export class CategoryNavComponent {
  menuService = inject(MenuService);

  onSelectCategory(catId: FoodCategory): void {
    this.menuService.setCategory(catId);
    const menuSection = document.getElementById('menu');
    if (menuSection) {
      const headerOffset = 135;
      const elementPosition = menuSection.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }
}
