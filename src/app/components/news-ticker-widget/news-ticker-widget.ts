import { Component, effect, inject, signal } from '@angular/core';
import { NewsArticle, NewsTickerService } from './news-ticker-service';

type TickerPhase = 'entering' | 'visible' | 'leaving';

@Component({
  selector: 'app-news-ticker-widget',
  imports: [],
  templateUrl: './news-ticker-widget.html',
  styleUrl: './news-ticker-widget.scss',
})
export class NewsTickerWidget {
  private newsTickerService = inject(NewsTickerService);

  news = this.newsTickerService.articles;

  currentIndex = signal(0);
  phase = signal<TickerPhase>('entering');

  private started = false;
  private timers: number[] = [];

  private readonly enterDuration = 650;
  private readonly visibleDuration = 4200;
  private readonly leaveDuration = 650;
  private readonly gapDuration = 120;

  currentItem = (): NewsArticle | null => {
    const items = this.news();
    console.log('items', items);
    if (!items.length) return null;
    return items[this.currentIndex()];
  };

  constructor() {
    effect(() => {
      const items = this.news();

      if (items.length && !this.started) {
        this.started = true;
        this.startTicker();
      }
    });
  }

  ngOnInit(): void {
    this.newsTickerService.fetchFinanceNews();
  }

  ngOnDestroy(): void {
    this.clearTimers();
  }

  private startTicker(): void {
    this.runCycle();
  }

  private runCycle(): void {
    const items = this.news();
    if (!items.length) return;

    const totalDuration =
      this.enterDuration +
      this.visibleDuration +
      this.leaveDuration +
      this.gapDuration;

    this.phase.set('entering');

    this.timers.push(
      window.setTimeout(() => {
        this.phase.set('visible');
      }, this.enterDuration)
    );

    this.timers.push(
      window.setTimeout(() => {
        this.phase.set('leaving');
      }, this.enterDuration + this.visibleDuration)
    );

    this.timers.push(
      window.setTimeout(() => {
        const next = (this.currentIndex() + 1) % items.length;
        this.currentIndex.set(next);
        this.runCycle();
      }, totalDuration)
    );
  }

  private clearTimers(): void {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers = [];
  }
}