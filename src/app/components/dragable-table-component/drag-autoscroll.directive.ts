/* =========================
 drag-autoscroll.directive.ts
========================= */

import { Directive, ElementRef, HostBinding, Input, NgZone, OnDestroy, inject } from '@angular/core';

export type AutoScrollTarget = 'self' | 'window' | 'page';

@Directive({
    selector: '[appDragAutoScroll]',
    standalone: true,
    exportAs: 'appDragAutoScroll',
})
export class DragAutoScrollDirective implements OnDestroy {
    private hostEl = inject(ElementRef<HTMLElement>);
    private zone = inject(NgZone);

    @Input() enabled = false;
    @Input() edgePx = 40;
    @Input() maxStep = 18;
    @Input() target: AutoScrollTarget = 'self';

    @Input() scrollContainer?: HTMLElement | null;

    @HostBinding('class.drag-outside') dragOutside = false;

    private pageScrollEl: HTMLElement | null = null;

    private dragging = false;
    private lastPointerY = 0;
    private rafId: number | null = null;
    private removePointerMove?: () => void;
    private removePointerUp?: () => void;

    ngOnDestroy(): void {
        this.stop();
    }

    start(): void {
        if (!this.enabled) return;

        if (this.target === 'page') {
            this.pageScrollEl = this.findScrollableParent(this.hostEl.nativeElement) ?? document.documentElement;
        }

        this.dragging = true;
        this.dragOutside = false;

        this.zone.runOutsideAngular(() => {
            const onMove = (e: PointerEvent) => {
                this.lastPointerY = e.clientY;
            };

            const onUp = () => this.stop();

            window.addEventListener('pointermove', onMove, { passive: true });
            window.addEventListener('pointerup', onUp, { passive: true });

            this.removePointerMove = () => window.removeEventListener('pointermove', onMove);
            this.removePointerUp = () => window.removeEventListener('pointerup', onUp);

            this.tick();
        });
    }

    stop(): void {
        this.dragging = false;
        this.dragOutside = false;

        if (this.rafId !== null) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }

        this.removePointerMove?.();
        this.removePointerUp?.();
        this.removePointerMove = undefined;
        this.removePointerUp = undefined;

        this.pageScrollEl = null;
    }

    onListExited(): void {
        this.dragOutside = true;
    }

    onListEntered(): void {
        this.dragOutside = false;
    }

    private tick(): void {
        if (!this.dragging) return;

        const targetRect = this.getScrollTargetRect();
        if (!targetRect) {
            this.rafId = requestAnimationFrame(() => this.tick());
            return;
        }

        const topZone = targetRect.top + this.edgePx;
        const bottomZone = targetRect.bottom - this.edgePx;

        let delta = 0;

        if (this.lastPointerY < topZone) {
            const t = clamp01((topZone - this.lastPointerY) / this.edgePx);
            delta = -Math.ceil(t * this.maxStep);
        } else if (this.lastPointerY > bottomZone) {
            const t = clamp01((this.lastPointerY - bottomZone) / this.edgePx);
            delta = Math.ceil(t * this.maxStep);
        }

        if (delta !== 0) {
            this.applyScrollDelta(delta);
        }

        this.rafId = requestAnimationFrame(() => this.tick());
    }

    private getScrollTargetRect(): DOMRect | null {
        if (this.target === 'window') {
            return new DOMRect(0, 0, window.innerWidth, window.innerHeight);
        }

        if (this.target === 'page') {
            const el = this.pageScrollEl ?? document.documentElement;
            return el.getBoundingClientRect();
        }

        const el = this.scrollContainer ?? undefined;
        return el ? el.getBoundingClientRect() : null;
    }

    private applyScrollDelta(delta: number): void {
        if (this.target === 'window') {
            window.scrollBy({ top: delta, left: 0, behavior: 'auto' });
            return;
        }

        if (this.target === 'page') {
            const el = this.pageScrollEl ?? document.documentElement;
            el.scrollTop += delta;
            return;
        }

        const el = this.scrollContainer ?? undefined;
        if (el) el.scrollTop += delta;
    }

    private findScrollableParent(start: HTMLElement): HTMLElement | null {
        let el: HTMLElement | null = start;

        while (el) {
            const style = getComputedStyle(el);
            const overflowY = style.overflowY;

            const canScroll = (overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight;

            if (canScroll) return el;

            el = el.parentElement;
        }

        return null;
    }
}

function clamp01(x: number): number {
    return Math.max(0, Math.min(1, x));
}
