import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface NewsArticle {
  title: string;
  link: string;
  source_id: string;
}

@Injectable({
  providedIn: 'root',
})
export class NewsTickerService {
  private http = inject(HttpClient);
  private apiKey = environment.newsApiKey;

  articles = signal<NewsArticle[]>([]);

  fetchFinanceNews() {
    const url = `https://newsdata.io/api/1/news?apikey=${this.apiKey}&q=finance&country=us`;

    this.http.get<{ results: NewsArticle[] }>(url).subscribe({
      next: (res) => this.articles.set(res.results),
      error: (err) => console.error('News loading error:', err)
    });
  }
}
