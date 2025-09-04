"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import AuthService from "../../lib/auth";
import { SerieCard } from "../../components/SerieCard";
import { SerieDialog } from "../../components/SerieDialog";
import { TmdbSerie } from "../../lib/types";
import { seriesApi, favoriteSeriesApi } from "../../lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Tv,
  Search,
  TrendingUp,
  Clock,
  Play,
  X,
  Star,
  Calendar,
  Radio,
} from "lucide-react";

export default function SeriesPage() {
  const [series, setSeries] = useState<TmdbSerie[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSerie, setSelectedSerie] = useState<TmdbSerie | null>(null);
  const [serieDetails, setSerieDetails] = useState<TmdbSerie | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [favoriteStatus, setFavoriteStatus] = useState<Record<number, boolean>>(
    {}
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<TmdbSerie[]>([]);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<
    "popular" | "airing-today" | "on-the-air" | "top-rated"
  >("popular");
  const router = useRouter();

  useEffect(() => {
    // Verificar autenticação
    if (!AuthService.isAuthenticated()) {
      router.push("/login");
      return;
    }

    // Limpar cache de favoritos sempre que a página for carregada
    setFavoriteStatus({});

    // Carregar séries populares iniciais
    loadPopularSeries(1);
  }, [router]);

  const loadSeriesByCategory = async (
    category: "popular" | "airing-today" | "on-the-air" | "top-rated",
    page: number
  ) => {
    try {
      console.log(
        `Carregando séries por categoria: ${category} - página:`,
        page
      );
      let series;

      switch (category) {
        case "popular":
          series = await seriesApi.getPopularSeries(page);
          break;
        case "airing-today":
          series = await seriesApi.getAiringTodaySeries(page);
          break;
        case "on-the-air":
          series = await seriesApi.getOnTheAirSeries(page);
          break;
        case "top-rated":
          series = await seriesApi.getTopRatedSeries(page);
          break;
        default:
          series = await seriesApi.getPopularSeries(page);
      }

      console.log("Séries recebidas:", series);

      if (page === 1) {
        setSeries(series);
      } else {
        setSeries((prev) => [...prev, ...series]);
      }

      // Carregar status de favoritos para as novas séries
      await loadFavoriteStatus(series);

      setCurrentPage(page);
    } catch (error: any) {
      console.error("Erro ao carregar séries:", error);
      toast.error("Erro ao carregar séries", {
        description: "Não foi possível carregar a lista de séries",
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadPopularSeries = async (page: number) => {
    await loadSeriesByCategory("popular", page);
  };

  const loadMoreSeries = () => {
    if (!loadingMore) {
      setLoadingMore(true);
      if (isSearchMode) {
        loadMoreSearchResults();
      } else {
        loadSeriesByCategory(categoryFilter, currentPage + 1);
      }
    }
  };

  const loadMoreSearchResults = async () => {
    try {
      const searchData = await seriesApi.searchSeries(
        searchQuery,
        currentPage + 1
      );
      // O backend retorna o array diretamente
      const newResults = Array.isArray(searchData) ? searchData : [];

      setSearchResults((prev) => [...prev, ...newResults]);
      setCurrentPage(currentPage + 1);

      // Carregar status de favoritos para os novos resultados
      await loadFavoriteStatus(newResults);
    } catch (error: any) {
      console.error("Erro ao carregar mais resultados:", error);
      toast.error("Erro ao carregar mais resultados");
    } finally {
      setLoadingMore(false);
    }
  };

  const loadFavoriteStatus = async (seriesList: TmdbSerie[]) => {
    try {
      const statusPromises = seriesList.map(async (serie) => {
        try {
          const isFavorite = await favoriteSeriesApi.getFavoriteStatus(
            serie.id.toString()
          );
          return { serieId: serie.id, isFavorite };
        } catch (error) {
          console.error(
            `Erro ao verificar favorito para série ${serie.id}:`,
            error
          );
          return { serieId: serie.id, isFavorite: false };
        }
      });

      const statuses = await Promise.all(statusPromises);
      const statusMap: Record<number, boolean> = {};
      statuses.forEach(({ serieId, isFavorite }) => {
        statusMap[serieId] = isFavorite;
      });

      setFavoriteStatus((prev) => ({ ...prev, ...statusMap }));
    } catch (error) {
      console.error("Erro ao carregar status de favoritos:", error);
    }
  };

  const handleToggleFavorite = async (serieId: number) => {
    try {
      console.log("Tentando alterar favorito para série:", serieId);
      await favoriteSeriesApi.toggleFavorite(serieId.toString());

      // Buscar o status atualizado diretamente do servidor para garantir consistência
      const updatedStatus = await favoriteSeriesApi.getFavoriteStatus(
        serieId.toString()
      );
      setFavoriteStatus((prev) => ({ ...prev, [serieId]: updatedStatus }));

      console.log("Status alterado com sucesso:", updatedStatus);
      toast.success(
        updatedStatus
          ? "Série adicionada aos favoritos!"
          : "Série removida dos favoritos!"
      );
    } catch (error) {
      console.error("Erro ao alterar favorito:", error);
      toast.error("Erro ao alterar favorito");
    }
  };

  const handleSerieClick = async (serie: TmdbSerie) => {
    setSelectedSerie(serie);
    setDialogOpen(true);

    try {
      console.log("Carregando detalhes da série:", serie.id);
      // Carregar detalhes completos da série
      const serieDetails = await seriesApi.getSerieDetails(serie.id);
      console.log("Detalhes da série recebidos:", serieDetails);
      setSerieDetails(serieDetails);
    } catch (error: any) {
      console.error("Erro ao carregar detalhes da série:", error);
      toast.error("Erro ao carregar detalhes", {
        description: "Não foi possível carregar os detalhes da série",
      });
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedSerie(null);
    setSerieDetails(null);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setIsSearchMode(true);

    try {
      console.log("Buscar séries:", searchQuery);
      const searchData = await seriesApi.searchSeries(searchQuery, 1);
      console.log("Resultados da busca completos:", searchData);
      console.log("Tipo de searchData:", typeof searchData);
      console.log("É array?", Array.isArray(searchData));

      // O backend retorna o array diretamente, não um objeto com propriedade results
      const results = Array.isArray(searchData) ? searchData : [];
      setSearchResults(results);
      setCurrentPage(1);

      // Carregar status de favoritos para os resultados da busca
      await loadFavoriteStatus(results);

      console.log("Estado após setSearchResults:", results);
      toast.success(
        `Encontrados ${results.length} resultados para "${searchQuery}"`
      );
    } catch (error: any) {
      console.error("Erro ao buscar séries:", error);
      toast.error("Erro na busca", {
        description: "Não foi possível realizar a busca. Tente novamente.",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setIsSearchMode(false);
    setCurrentPage(1);
    // Recarregar séries da categoria atual
    setLoading(true);
    loadSeriesByCategory(categoryFilter, 1);
  };

  const handleCategoryChange = (
    category: "popular" | "airing-today" | "on-the-air" | "top-rated"
  ) => {
    setCategoryFilter(category);
    setSearchQuery("");
    setSearchResults([]);
    setIsSearchMode(false);
    setCurrentPage(1);
    setLoading(true);
    loadSeriesByCategory(category, 1);
  };

  const getCategoryInfo = () => {
    switch (categoryFilter) {
      case "popular":
        return { icon: TrendingUp, text: "Populares" };
      case "airing-today":
        return { icon: Play, text: "Exibindo Hoje" };
      case "on-the-air":
        return { icon: Radio, text: "No Ar" };
      case "top-rated":
        return { icon: Star, text: "Mais Avaliadas" };
      default:
        return { icon: TrendingUp, text: "Populares" };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-slate-400 font-medium">Carregando séries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search Section */}
        <Card className="mb-8 bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-white flex items-center space-x-2">
              <Search className="w-5 h-5 text-green-400" />
              <span>Buscar Séries</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-3">
              <div className="flex-1 relative">
                <Input
                  placeholder="Digite o nome da série..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 pr-10"
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <Button
                onClick={handleSearch}
                disabled={!searchQuery.trim() || isSearching}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                {isSearching ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Category Filter Buttons */}
            {!isSearchMode && (
              <div className="mt-4 flex items-center space-x-2">
                <span className="text-sm text-slate-400 font-medium">
                  Categoria:
                </span>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={categoryFilter === "popular" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleCategoryChange("popular")}
                    className={`${
                      categoryFilter === "popular"
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 mr-1" />
                    Populares
                  </Button>
                  <Button
                    variant={
                      categoryFilter === "airing-today" ? "default" : "ghost"
                    }
                    size="sm"
                    onClick={() => handleCategoryChange("airing-today")}
                    className={`${
                      categoryFilter === "airing-today"
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                    }`}
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Exibindo Hoje
                  </Button>
                  <Button
                    variant={
                      categoryFilter === "on-the-air" ? "default" : "ghost"
                    }
                    size="sm"
                    onClick={() => handleCategoryChange("on-the-air")}
                    className={`${
                      categoryFilter === "on-the-air"
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                    }`}
                  >
                    <Radio className="w-4 h-4 mr-1" />
                    No Ar
                  </Button>
                  <Button
                    variant={
                      categoryFilter === "top-rated" ? "default" : "ghost"
                    }
                    size="sm"
                    onClick={() => handleCategoryChange("top-rated")}
                    className={`${
                      categoryFilter === "top-rated"
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                    }`}
                  >
                    <Star className="w-4 h-4 mr-1" />
                    Mais Avaliadas
                  </Button>
                </div>
              </div>
            )}

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Badge
                  variant="secondary"
                  className={`${
                    isSearchMode
                      ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      : "bg-green-500/10 text-green-400 border-green-500/20"
                  }`}
                >
                  {isSearchMode ? (
                    <>
                      <Search className="w-3 h-3 mr-1" />
                      Resultados da Busca
                    </>
                  ) : (
                    <>
                      {(() => {
                        const { icon: Icon, text } = getCategoryInfo();
                        return (
                          <>
                            <Icon className="w-3 h-3 mr-1" />
                            {text}
                          </>
                        );
                      })()}
                    </>
                  )}
                </Badge>
                <span className="text-slate-400 text-sm">
                  {isSearchMode ? searchResults.length : series.length} séries
                </span>
                {isSearchMode && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSearch}
                    className="text-slate-400 hover:text-slate-300 px-2 py-1 h-6"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Limpar busca
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grid de séries */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-6 mb-8">
          {(isSearchMode ? searchResults : series).map((serie, index) => (
            <div
              key={`${serie.id}-${index}`}
              className="group transition-all duration-300 hover:scale-[1.02]"
            >
              <SerieCard
                serie={serie}
                onClick={() => handleSerieClick(serie)}
                showFavoriteButton={true}
                isFavorite={favoriteStatus[serie.id] || false}
                onFavoriteToggle={() => handleToggleFavorite(serie.id)}
              />
            </div>
          ))}
        </div>

        {/* Mensagem quando não há resultados na busca */}
        {isSearchMode && searchResults.length === 0 && !isSearching && (
          <div className="text-center py-12">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-8 border border-slate-700/50">
              <Tv className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-slate-300 text-lg font-medium mb-2">
                Nenhuma série encontrada
              </h3>
              <p className="text-slate-400 mb-4">
                Não encontramos séries para "{searchQuery}". Tente um termo
                diferente.
              </p>
              <Button
                onClick={clearSearch}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Voltar aos populares
              </Button>
            </div>
          </div>
        )}

        {/* Botão carregar mais */}
        <div className="text-center">
          <Button
            onClick={loadMoreSeries}
            disabled={loadingMore}
            size="lg"
            variant="outline"
            className="bg-slate-800/50 hover:bg-slate-700/50 border-slate-600 text-slate-300 hover:text-white disabled:opacity-50"
          >
            {loadingMore ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-400"></div>
                <span>Carregando...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Carregar Mais</span>
              </div>
            )}
          </Button>
        </div>
      </main>

      {/* Dialog de detalhes da série */}
      {selectedSerie && (
        <SerieDialog
          serie={selectedSerie}
          serieDetails={serieDetails}
          isOpen={dialogOpen}
          onClose={handleCloseDialog}
        />
      )}
    </div>
  );
}
