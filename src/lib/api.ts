import axios from "axios";
import Cookies from "js-cookie";
import { ErrorHandler } from "./errorHandler";
import { toast } from "sonner";

// Configuração base da API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Instância do axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 segundos
});

// Interceptor para adicionar token em todas as requisições (exceto endpoints públicos)
api.interceptors.request.use(
  (config) => {
    // Endpoints que não precisam de autenticação
    const publicEndpoints = ["/auth/login", "/auth/register"];
    const isPublicEndpoint = publicEndpoints.some((endpoint) =>
      config.url?.includes(endpoint)
    );

    // Só adiciona o token se não for um endpoint público
    if (!isPublicEndpoint) {
      const token = Cookies.get("auth_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    const apiError = ErrorHandler.createApiError(error);
    ErrorHandler.logError(apiError, "Request Interceptor");
    return Promise.reject(apiError);
  }
);

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const apiError = ErrorHandler.createApiError(error);

    // Log do erro
    ErrorHandler.logError(apiError, "Response Interceptor");

    // Tratamento específico por tipo de erro
    if (error.response?.status === 401) {
      // Verificar se é um erro de login ou token expirado
      const isLoginEndpoint = error.config?.url?.includes("/auth/login");

      if (!isLoginEndpoint) {
        // Token expirado ou inválido (não é login)
        Cookies.remove("auth_token");
        Cookies.remove("user_data");
        toast.error("Sessão expirada", {
          description: "Faça login novamente para continuar",
        });

        // Evitar redirecionamento em loop se já estiver na página de login
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
      } else {
        // Se for login, apenas limpar tokens antigos sem toast - deixar componente tratar
        Cookies.remove("auth_token");
        Cookies.remove("user_data");
      }
    }
    // Para outros erros, não mostrar toast aqui - deixar o componente tratar
    // usando a mensagem correta do ErrorHandler

    return Promise.reject(apiError);
  }
);

// Funções específicas para filmes
export const moviesApi = {
  // Buscar filmes populares
  getPopularMovies: async (page: number = 1) => {
    console.log(`Fazendo requisição para filmes populares - página ${page}`);
    console.log(
      `URL da requisição: ${API_BASE_URL}/movies/popular?page=${page}`
    );
    const response = await api.get(`/movies/popular?page=${page}`);
    console.log("Resposta da API para filmes populares:", response);
    return response.data;
  },

  // Buscar filmes em cartaz
  getNowPlayingMovies: async (page: number = 1) => {
    console.log(`Fazendo requisição para filmes em cartaz - página ${page}`);
    const response = await api.get(`/movies/now-playing?page=${page}`);
    console.log("Resposta da API para filmes em cartaz:", response);
    return response.data;
  },

  // Buscar filmes mais bem avaliados
  getTopRatedMovies: async (page: number = 1) => {
    console.log(
      `Fazendo requisição para filmes mais bem avaliados - página ${page}`
    );
    const response = await api.get(`/movies/top-rated?page=${page}`);
    console.log("Resposta da API para filmes mais bem avaliados:", response);
    return response.data;
  },

  // Buscar filmes em breve
  getUpcomingMovies: async (page: number = 1) => {
    console.log(`Fazendo requisição para filmes em breve - página ${page}`);
    const response = await api.get(`/movies/upcoming?page=${page}`);
    console.log("Resposta da API para filmes em breve:", response);
    return response.data;
  },

  // Buscar filmes por query
  searchMovies: async (query: string, page: number = 1) => {
    console.log(
      `Fazendo requisição para buscar filmes - query: ${query}, página: ${page}`
    );
    const response = await api.get(
      `/movies/search?query=${encodeURIComponent(query)}&page=${page}`
    );
    console.log("Resposta da API para busca de filmes:", response);
    return response.data;
  },

  // Obter detalhes de um filme
  getMovieDetails: async (movieId: string | number) => {
    console.log(`Fazendo requisição para detalhes do filme - ID: ${movieId}`);
    console.log(`URL da requisição: ${API_BASE_URL}/movies/${movieId}`);
    const response = await api.get(`/movies/${movieId}`);
    console.log("Resposta da API para detalhes do filme:", response);
    return response.data;
  },
};

// Funções específicas para séries
export const seriesApi = {
  // Buscar séries populares
  getPopularSeries: async (page: number = 1) => {
    console.log(`Fazendo requisição para séries populares - página ${page}`);
    console.log(
      `URL da requisição: ${API_BASE_URL}/series/popular?page=${page}`
    );
    const response = await api.get(`/series/popular?page=${page}`);
    console.log("Resposta da API para séries populares:", response);
    return response.data;
  },

  // Buscar séries sendo exibidas hoje
  getAiringTodaySeries: async (page: number = 1) => {
    console.log(
      `Fazendo requisição para séries sendo exibidas hoje - página ${page}`
    );
    const response = await api.get(`/series/airing-today?page=${page}`);
    console.log("Resposta da API para séries sendo exibidas hoje:", response);
    return response.data;
  },

  // Buscar séries no ar
  getOnTheAirSeries: async (page: number = 1) => {
    console.log(`Fazendo requisição para séries no ar - página ${page}`);
    const response = await api.get(`/series/on-the-air?page=${page}`);
    console.log("Resposta da API para séries no ar:", response);
    return response.data;
  },

  // Buscar séries mais bem avaliadas
  getTopRatedSeries: async (page: number = 1) => {
    console.log(
      `Fazendo requisição para séries mais bem avaliadas - página ${page}`
    );
    const response = await api.get(`/series/top-rated?page=${page}`);
    console.log("Resposta da API para séries mais bem avaliadas:", response);
    return response.data;
  },

  // Buscar séries por query
  searchSeries: async (query: string, page: number = 1) => {
    console.log(
      `Fazendo requisição para buscar séries - query: ${query}, página: ${page}`
    );
    const response = await api.get(
      `/series/search?query=${encodeURIComponent(query)}&page=${page}`
    );
    console.log("Resposta da API para busca de séries:", response);
    return response.data;
  },

  // Obter detalhes de uma série
  getSerieDetails: async (serieId: string | number) => {
    console.log(`Fazendo requisição para detalhes da série - ID: ${serieId}`);
    console.log(`URL da requisição: ${API_BASE_URL}/series/${serieId}`);
    const response = await api.get(`/series/${serieId}`);
    console.log("Resposta da API para detalhes da série:", response);
    return response.data;
  },
};

// Funções específicas para avaliações de filmes
export const ratingMoviesApi = {
  // Avaliar um filme
  rateMovie: async (
    movieId: string | number,
    rating: string,
    title: string,
    poster_path: string,
    comment?: string
  ) => {
    console.log(
      `Avaliando filme - ID: ${movieId}, Rating: ${rating}, Comment: ${
        comment ? "sim" : "não"
      }`
    );
    const params: any = {
      movieId: movieId.toString(),
      rating,
      title,
      poster_path,
    };

    if (comment) {
      params.comment = comment;
    }

    const response = await api.post("/rate/movies", null, { params });
    console.log("Resposta da API para avaliação de filme:", response);
    return response.data;
  },

  // Buscar filmes avaliados pelo usuário
  getRatedMovies: async () => {
    console.log("Buscando filmes avaliados pelo usuário");
    const response = await api.get("/rate/movies");
    console.log("Resposta da API para filmes avaliados:", response);
    return response.data;
  },

  // Buscar avaliação específica de um filme
  getMovieRating: async (movieId: string | number) => {
    console.log(`Buscando avaliação do filme ID: ${movieId}`);
    try {
      const ratedMovies = await ratingMoviesApi.getRatedMovies();
      const movieRating = ratedMovies.find(
        (movie: any) => movie.movieId === movieId.toString()
      );
      return movieRating || null;
    } catch (error) {
      console.log("Erro ao buscar avaliação do filme:", error);
      return null;
    }
  },
};

// Funções específicas para avaliações de séries
export const ratingSeriesApi = {
  // Avaliar uma série
  rateSerie: async (
    serieId: string | number,
    rating: string,
    title: string,
    poster_path: string,
    comment?: string
  ) => {
    console.log(
      `Avaliando série - ID: ${serieId}, Rating: ${rating}, Comment: ${
        comment ? "sim" : "não"
      }`
    );
    const params: any = {
      serieId: serieId.toString(),
      rating,
      title,
      poster_path,
    };

    if (comment) {
      params.comment = comment;
    }

    const response = await api.post("/rate/series", null, { params });
    console.log("Resposta da API para avaliação de série:", response);
    return response.data;
  },

  // Buscar séries avaliadas pelo usuário
  getRatedSeries: async () => {
    console.log("Buscando séries avaliadas pelo usuário");
    const response = await api.get("/rate/series");
    console.log("Resposta da API para séries avaliadas:", response);
    return response.data;
  },

  // Buscar avaliação específica de uma série
  getSerieRating: async (serieId: string | number) => {
    console.log(`Buscando avaliação da série ID: ${serieId}`);
    try {
      const ratedSeries = await ratingSeriesApi.getRatedSeries();
      const serieRating = ratedSeries.find(
        (serie: any) => serie.serieId === serieId.toString()
      );
      return serieRating || null;
    } catch (error) {
      console.log("Erro ao buscar avaliação da série:", error);
      return null;
    }
  },
};

// API para gerenciar favoritos de filmes
export const favoriteMoviesApi = {
  // Adicionar/remover filme dos favoritos
  toggleFavorite: async (movieId: string): Promise<void> => {
    console.log(
      `FRONTEND FILME: Alterando status de favorito do filme ID: ${movieId}`
    );
    console.log(
      `FRONTEND FILME: Fazendo POST para /favorite/movies/ com movieId=${movieId}`
    );
    const response = await api.post(`/favorite/movies/`, null, {
      params: { movieId },
    });
    console.log(`FRONTEND FILME: Resposta recebida:`, response.data);
    return response.data;
  },

  // Verificar se um filme é favorito
  getFavoriteStatus: async (movieId: string): Promise<boolean> => {
    console.log(
      `FRONTEND FILME: Verificando se filme ID: ${movieId} é favorito`
    );
    const response = await api.get(`/favorite/movies/status`, {
      params: { movieId },
    });
    console.log(
      `FRONTEND FILME: Status recebido para ${movieId}:`,
      response.data
    );
    return response.data;
  },

  // Obter todos os filmes favoritos
  getFavoriteMovies: async (): Promise<any[]> => {
    console.log("FRONTEND FILME: Buscando filmes favoritos");
    const response = await api.get(`/favorite/movies/`);
    console.log("FRONTEND FILME: Filmes favoritos recebidos:", response.data);
    return response.data;
  },
};

// API para gerenciar favoritos de séries
export const favoriteSeriesApi = {
  // Adicionar/remover série dos favoritos
  toggleFavorite: async (serieId: string): Promise<void> => {
    console.log(
      `FRONTEND SÉRIE: Alterando status de favorito da série ID: ${serieId}`
    );
    console.log(
      `FRONTEND SÉRIE: Fazendo POST para /favorite/series/ com serieId=${serieId}`
    );
    const response = await api.post(`/favorite/series/`, null, {
      params: { serieId },
    });
    console.log(`FRONTEND SÉRIE: Resposta recebida:`, response.data);
    return response.data;
  },

  // Verificar se uma série é favorita
  getFavoriteStatus: async (serieId: string): Promise<boolean> => {
    console.log(
      `FRONTEND SÉRIE: Verificando se série ID: ${serieId} é favorita`
    );
    const response = await api.get(`/favorite/series/status`, {
      params: { serieId },
    });
    console.log(
      `FRONTEND SÉRIE: Status recebido para ${serieId}:`,
      response.data
    );
    return response.data;
  },

  // Obter todas as séries favoritas
  getFavoriteSeries: async (): Promise<any[]> => {
    console.log("FRONTEND SÉRIE: Buscando séries favoritas");
    const response = await api.get(`/favorite/series/`);
    console.log("FRONTEND SÉRIE: Séries favoritas recebidas:", response.data);
    return response.data;
  },
};

export default api;
