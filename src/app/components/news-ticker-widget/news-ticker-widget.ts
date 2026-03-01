import { Component, inject } from '@angular/core';
import { NewsTickerService } from './news-ticker-service';
import { UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-news-ticker-widget',
  imports: [UpperCasePipe],
  templateUrl: './news-ticker-widget.html',
  styleUrl: './news-ticker-widget.scss',
})
export class NewsTickerWidget {
  private newsTickerService = inject(NewsTickerService);

  news = this.newsTickerService.articles;

  ngOnInit() {
    this.newsTickerService.fetchFinanceNews();
  }
}
