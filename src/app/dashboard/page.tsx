"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthService from "../../lib/auth";
import {
  favoriteMoviesApi,
  favoriteSeriesApi,
  ratingMoviesApi,
  ratingSeriesApi,
} from "../../lib/api";
import { User } from "../../lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Film, Tv, Heart, Star, TrendingUp, Activity } from "lucide-react";

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    totalMovieRatings: 0,
    totalSerieRatings: 0,
    totalFavoriteMovies: 0,
    totalFavoriteSeries: 0,
    averageMovieRating: 0,
    averageSerieRating: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Verificar autenticação
    if (!AuthService.isAuthenticated()) {
      router.push("/login");
      return;
    }

    // Obter dados do usuário
    const userData = AuthService.getCurrentUser();
    setUser(userData);
    setLoading(false);

    // Carregar estatísticas
    loadStatistics();
  }, [router]);

  const loadStatistics = async () => {
    setLoadingStats(true);
    try {
      const [favoriteMovies, favoriteSeries, movieRatings, serieRatings] =
        await Promise.all([
          favoriteMoviesApi.getFavoriteMovies().catch(() => []),
          favoriteSeriesApi.getFavoriteSeries().catch(() => []),
          ratingMoviesApi.getRatedMovies().catch(() => []),
          ratingSeriesApi.getRatedSeries().catch(() => []),
        ]);

      // Calcular média das avaliações de filmes
      const avgMovieRating =
        movieRatings.length > 0
          ? movieRatings.reduce(
              (sum: number, rating: any) => sum + parseFloat(rating.myVote),
              0
            ) / movieRatings.length
          : 0;

      // Calcular média das avaliações de séries
      const avgSerieRating =
        serieRatings.length > 0
          ? serieRatings.reduce(
              (sum: number, rating: any) => sum + parseFloat(rating.myVote),
              0
            ) / serieRatings.length
          : 0;

      setStatistics({
        totalMovieRatings: movieRatings.length,
        totalSerieRatings: serieRatings.length,
        totalFavoriteMovies: favoriteMovies.length,
        totalFavoriteSeries: favoriteSeries.length,
        averageMovieRating: avgMovieRating,
        averageSerieRating: avgSerieRating,
      });
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-slate-400 font-medium">
            Carregando seu dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Será redirecionado para login
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader className="pb-2 sm:pb-3">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="p-1.5 sm:p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                  <Film className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg text-white">
                    Filmes
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Descobrir e avaliar
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Button
                onClick={() => router.push("/movies")}
                className="w-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/20 cursor-pointer text-sm"
                variant="outline"
                size="sm"
              >
                Explorar filmes
              </Button>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
                  <Tv className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <CardTitle className="text-lg text-white">Séries</CardTitle>
                  <CardDescription>Maratonar e avaliar</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => router.push("/series")}
                className="w-full bg-green-500/10 hover:bg-green-500/20 text-green-400 border-green-500/20 cursor-pointer"
                variant="outline"
              >
                Explorar séries
              </Button>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg group-hover:bg-yellow-500/20 transition-colors">
                  <Star className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <CardTitle className="text-lg text-white">
                    Avaliações
                  </CardTitle>
                  <CardDescription>Suas classificações</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => router.push("/ratings")}
                className="w-full bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border-yellow-500/20 cursor-pointer"
                variant="outline"
              >
                Ver avaliações
              </Button>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-pink-500/10 rounded-lg group-hover:bg-pink-500/20 transition-colors">
                  <Heart className="w-6 h-6 text-pink-400" />
                </div>
                <div>
                  <CardTitle className="text-lg text-white">
                    Favoritos
                  </CardTitle>
                  <CardDescription>Sua lista especial</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => router.push("/favorites")}
                className="w-full bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 border-pink-500/20 cursor-pointer"
                variant="outline"
              >
                Ver favoritos
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Statistics Section */}
        <div className="mb-8">
          {/* Condicional: Mostrar estatísticas detalhadas ou card "Começar agora" */}
          {!loadingStats &&
          statistics.totalMovieRatings + statistics.totalSerieRatings > 0 ? (
            <Card className="lg:col-span-2 bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  <span>Estatísticas Detalhadas</span>
                </CardTitle>
                <CardDescription>
                  Seus dados de avaliações e favoritos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Seção Filmes */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-white flex items-center space-x-2">
                      <Film className="w-4 h-4 text-blue-400" />
                      <span>Filmes</span>
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                        <span className="text-slate-300">Avaliações</span>
                        <span className="text-blue-400 font-semibold">
                          {statistics.totalMovieRatings}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                        <span className="text-slate-300">Favoritos</span>
                        <span className="text-pink-400 font-semibold">
                          {statistics.totalFavoriteMovies}
                        </span>
                      </div>
                      {statistics.totalMovieRatings > 0 && (
                        <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                          <span className="text-slate-300">Média</span>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-yellow-400 font-semibold">
                              {statistics.averageMovieRating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Seção Séries */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-white flex items-center space-x-2">
                      <Tv className="w-4 h-4 text-green-400" />
                      <span>Séries</span>
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                        <span className="text-slate-300">Avaliações</span>
                        <span className="text-green-400 font-semibold">
                          {statistics.totalSerieRatings}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                        <span className="text-slate-300">Favoritos</span>
                        <span className="text-pink-400 font-semibold">
                          {statistics.totalFavoriteSeries}
                        </span>
                      </div>
                      {statistics.totalSerieRatings > 0 && (
                        <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                          <span className="text-slate-300">Média</span>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-yellow-400 font-semibold">
                              {statistics.averageSerieRating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ações rápidas */}
                <div className="mt-6 pt-4 border-t border-slate-700">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={() => router.push("/movies")}
                      className="flex-1 cursor-pointer"
                      variant="outline"
                    >
                      <Film className="w-4 h-4 mr-2" />
                      Ver filmes
                    </Button>
                    <Button
                      onClick={() => router.push("/series")}
                      className="flex-1 cursor-pointer"
                      variant="outline"
                    >
                      <Tv className="w-4 h-4 mr-2" />
                      Ver séries
                    </Button>
                    <Button
                      onClick={() => router.push("/favorites")}
                      className="flex-1 cursor-pointer"
                      variant="outline"
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      Favoritos
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="lg:col-span-2 bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Começar agora</CardTitle>
                <CardDescription>
                  Que tal começar avaliando alguns dos seus filmes e séries
                  favoritos?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => router.push("/movies")}
                    className="flex-1 cursor-pointer"
                    variant="default"
                  >
                    <Film className="w-4 h-4 mr-2" />
                    Avaliar filmes
                  </Button>
                  <Button
                    onClick={() => router.push("/series")}
                    className="flex-1 cursor-pointer"
                    variant="secondary"
                  >
                    <Tv className="w-4 h-4 mr-2" />
                    Avaliar séries
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Welcome Section */}
        <Card className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-slate-600/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl text-white">
              Sobre o LMS Films
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-white mb-2">
                  O que você pode fazer:
                </h3>
                <ul className="space-y-2 text-slate-300">
                  <li className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span>Avaliar filmes e séries com estrelas</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Heart className="w-4 h-4 text-pink-400" />
                    <span>Adicionar conteúdos aos seus favoritos</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                    <span>Acompanhar suas estatísticas</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">
                  Dicas para começar:
                </h3>
                <ul className="space-y-2 text-slate-300">
                  <li>• Pesquise por títulos que você já assistiu</li>
                  <li>• Use as estrelas para dar sua nota</li>
                  <li>• Adicione aos favoritos os que mais gostou</li>
                  <li>• Explore novos lançamentos e clássicos</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
