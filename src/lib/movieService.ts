import api from "./api";
import { Movie, FavoriteMovie, Serie, FavoriteSerie } from "./types";
import { toast } from "sonner";

class MovieService {
  // Buscar filmes avaliados pelo usuário
  async getUserMovies(): Promise<Movie[]> {
    try {
      const response = await api.get("/movies");
      return response.data;
    } catch (error: any) {
      // O erro já foi tratado pelo interceptor
      throw error;
    }
  }

  // Avaliar um filme
  async rateMovie(movieData: Partial<Movie>): Promise<Movie> {
    try {
      const response = await api.post("/movies/rate", movieData);

      toast.success("Filme avaliado!", {
        description: `Avaliação salva para "${movieData.title}"`,
      });

      return response.data;
    } catch (error: any) {
      // O erro já foi tratado pelo interceptor
      throw error;
    }
  }

  // Buscar filmes favoritos
  async getFavoriteMovies(): Promise<FavoriteMovie[]> {
    try {
      const response = await api.get("/movies/favorites");
      return response.data;
    } catch (error: any) {
      // O erro já foi tratado pelo interceptor
      throw error;
    }
  }

  // Adicionar/remover filme dos favoritos
  async toggleFavoriteMovie(movieId: string, title?: string): Promise<void> {
    try {
      await api.post("/movies/favorite", { movieId });

      toast.success("Favorito atualizado!", {
        description: title
          ? `"${title}" foi atualizado nos favoritos`
          : "Lista de favoritos atualizada",
      });
    } catch (error: any) {
      // O erro já foi tratado pelo interceptor
      throw error;
    }
  }

  // Buscar séries avaliadas pelo usuário
  async getUserSeries(): Promise<Serie[]> {
    try {
      const response = await api.get("/series");
      return response.data;
    } catch (error: any) {
      // O erro já foi tratado pelo interceptor
      throw error;
    }
  }

  // Avaliar uma série
  async rateSerie(serieData: Partial<Serie>): Promise<Serie> {
    try {
      const response = await api.post("/series/rate", serieData);

      toast.success("Série avaliada!", {
        description: `Avaliação salva para "${serieData.title}"`,
      });

      return response.data;
    } catch (error: any) {
      // O erro já foi tratado pelo interceptor
      throw error;
    }
  }

  // Buscar séries favoritas
  async getFavoriteSeries(): Promise<FavoriteSerie[]> {
    try {
      const response = await api.get("/series/favorites");
      return response.data;
    } catch (error: any) {
      // O erro já foi tratado pelo interceptor
      throw error;
    }
  }

  // Adicionar/remover série dos favoritos
  async toggleFavoriteSerie(serieId: string, title?: string): Promise<void> {
    try {
      await api.post("/series/favorite", { serieId });

      toast.success("Favorito atualizado!", {
        description: title
          ? `"${title}" foi atualizado nos favoritos`
          : "Lista de favoritos atualizada",
      });
    } catch (error: any) {
      // O erro já foi tratado pelo interceptor
      throw error;
    }
  }
}

export default new MovieService();
