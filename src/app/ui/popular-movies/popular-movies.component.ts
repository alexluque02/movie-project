import { Component, OnInit } from '@angular/core';
import { Observable, ObservableInput } from 'rxjs';
import { RatedMovie } from 'src/app/models/rated-movie-list.interface';
import { Movie, PopularMoviesListResponse} from 'src/app/models/movie-list.interface';
import { AccountService } from 'src/app/service/account.service';
import { MovieService } from 'src/app/service/movie-service';

@Component({
  selector: 'app-popular-movies',
  templateUrl: './popular-movies.component.html',
  styleUrls: ['./popular-movies.component.css']
})
export class PopularMoviesComponent implements OnInit {

  movieList: Movie[] = [];
  favList: Movie[] = [];
  ratedList: RatedMovie[] = [];
  watchList: Movie[] = [];
  count = 0;
  page = 1;
  pagesFavorites = 0;
  pagesWatchList = 0;
  selectedGenreId: number | null = null;
  request!: ObservableInput<any>;
  requests: Observable<PopularMoviesListResponse>[] = []
  search = false;
  name: string = '';

  constructor(private movieService: MovieService, private accountService: AccountService) { }

  ngOnInit(): void {
    this.loadNewPage();
  }

  loadNewPage() {
    if (this.name !== '') {
      this.search = true;
      this.movieService.searchMovieByPage(this.name, this.page).subscribe(resp => {
        this.movieList = resp.results;
        if (resp.total_results > 10000) {
          this.count = 10000;
        } else {
          this.count = resp.total_results;
        }
      });
    } else {
      this.search = false;

      if (this.selectedGenreId !== null && this.selectedGenreId !== -1) {
        this.loadPageForGenre();
      } else {
        this.loadPageForPopularMovies();
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  loadPageForPopularMovies() {
    this.getWatchList();
    this.getRatedList();
    this.getFavouriteResults();
    this.search = false;
    this.movieService.getPopularMoviesByPage(this.page).subscribe(resp => {
      this.movieList = resp.results;
      if (resp.total_results > 10000) {
        this.count = 10000;
      } else {
        this.count = resp.total_results;
      }
    })
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  loadPageForGenre() {
    this.getWatchList();
    this.getRatedList();
    this.search = false
    this.getFavouriteResults();
    this.movieService.getMoviesByGenreAndPage(this.selectedGenreId!, this.page).subscribe(resp => {
      this.movieList = resp.results;
      if (resp.total_results > 10000) {
        this.count = 10000;
      } else {
        this.count = resp.total_results;
      }
    })
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getFavouriteResults() {
    this.accountService.getFavoriteMovies().subscribe(resp => {
      this.pagesFavorites = resp.total_pages;
      if (this.pagesFavorites <= 1) {
        this.accountService.getFavoriteMovies().subscribe(resp => {
          this.favList = resp.results;
        });
      } else {
        for (let i = 1; i <= this.pagesFavorites; i++) {
          this.accountService.getFavoriteMoviesByPage(i).subscribe(resp => {
            this.favList = this.favList.concat(resp.results);
          })
        }
      }
    });
  }

  getRatedList() {
    this.accountService.getRatedMovies().subscribe(resp => {
      this.ratedList = resp.results});
  }

  getWatchList() {
    this.accountService.getMovieWatchlist().subscribe(resp => {
      this.pagesWatchList = resp.total_pages;
      if (this.pagesWatchList <= 1) {
        this.accountService.getMovieWatchlist().subscribe(resp => {
          this.watchList = resp.results;
        });
      } else {
        for (let i = 1; i <= this.pagesWatchList; i++) {
          this.accountService.getMovieWatchlistByPage(i).subscribe(resp => {
            this.watchList = this.watchList.concat(resp.results);
          })
        }
      }
    });
  }

  showAllMovies(id: number) {
    this.search = false
    this.selectedGenreId = id;
    this.page = 1;
    this.loadNewPage();
  }

  showMoviesByGenre(id: number) {
    this.search = false
    this.selectedGenreId = id;
    this.page = 1;
    this.loadNewPage();
  }

  loadPageByName(event: any) {
    this.name = event.target.value;

    if (this.name === '') {
      this.search = false;
      this.page = 1;
      this.loadNewPage();
    } else {
      this.search = true;
      this.movieService.searchMovieByPage(event.target.value, this.page).subscribe(resp => {
        this.movieList = resp.results;
        if (resp.total_results > 10000) {
          this.count = 10000;
        } else {
          this.count = resp.total_results;
        }
      });
    }
  }



}
