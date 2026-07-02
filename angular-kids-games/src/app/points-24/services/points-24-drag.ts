import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Points24DragService {
  private activeDrag?: {
    id: string;
    ghost: HTMLElement;
    pointerId: number;
  };

  private readonly onPointerMove = (event: PointerEvent) => this.moveGhost(event);
  private readonly onPointerUp = (event: PointerEvent) => this.dropGhost(event);
  private readonly onPointerCancel = () => this.cleanup();

  start(event: PointerEvent, source: HTMLElement): void {
    if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
    if (!source.id || this.activeDrag) return;

    event.preventDefault();

    const ghost = source.cloneNode(true) as HTMLElement;
    const rect = source.getBoundingClientRect();

    ghost.removeAttribute('id');
    ghost.style.position = 'fixed';
    ghost.style.left = `${event.clientX - rect.width / 2}px`;
    ghost.style.top = `${event.clientY - rect.height / 2}px`;
    ghost.style.width = `${rect.width}px`;
    ghost.style.height = `${rect.height}px`;
    ghost.style.pointerEvents = 'none';
    ghost.style.opacity = '0.82';
    ghost.style.zIndex = '2000';
    ghost.style.transform = 'scale(1.04)';
    ghost.style.boxShadow = '0 10px 24px rgba(0, 0, 0, 0.22)';

    document.body.appendChild(ghost);
    document.body.classList.add('points24-dragging');

    this.activeDrag = {
      id: source.id,
      ghost,
      pointerId: event.pointerId
    };

    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('pointercancel', this.onPointerCancel);
  }

  private moveGhost(event: PointerEvent): void {
    if (!this.activeDrag || event.pointerId !== this.activeDrag.pointerId) return;

    event.preventDefault();
    const ghost = this.activeDrag.ghost;
    ghost.style.left = `${event.clientX - ghost.offsetWidth / 2}px`;
    ghost.style.top = `${event.clientY - ghost.offsetHeight / 2}px`;
  }

  private dropGhost(event: PointerEvent): void {
    if (!this.activeDrag || event.pointerId !== this.activeDrag.pointerId) return;

    const target = document.elementFromPoint(event.clientX, event.clientY);
    const dropTarget = target?.closest('.points24-drop-target');

    if (dropTarget) {
      dropTarget.dispatchEvent(new CustomEvent('points24drop', {
        bubbles: true,
        detail: { id: this.activeDrag.id }
      }));
    }

    this.cleanup();
  }

  private cleanup(): void {
    this.activeDrag?.ghost.remove();
    this.activeDrag = undefined;
    document.body.classList.remove('points24-dragging');

    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('pointercancel', this.onPointerCancel);
  }

}
