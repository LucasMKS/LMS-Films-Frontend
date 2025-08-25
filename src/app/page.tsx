"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthService from "../lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Film,
  Star,
  Heart,
  Users,
  TrendingUp,
  Play,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Simular um pequeno delay para mostrar a página inicial
    const timer = setTimeout(() => {
      const authenticated = AuthService.isAuthenticated();
      setIsAuthenticated(authenticated);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  };

  const handleLogin = () => {
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4">
            <Film className="w-8 h-8 text-white animate-pulse" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-slate-400">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

      {/* Header */}
      <header className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
              <Film className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">LMS Films</span>
          </div>

          <Button
            onClick={handleLogin}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-800/50 backdrop-blur-sm"
          >
            {isAuthenticated ? "Dashboard" : "Entrar"}
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 px-6 py-16">
        <div className="max-w-7xl mx-auto">
          {/* Hero Content */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-pink-500/10 to-violet-600/10 border border-pink-500/20 rounded-full px-4 py-2 mb-8">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span className="text-pink-300 text-sm font-medium">
                Sua plataforma de avaliação de filmes e séries
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Descubra, Avalie e
              <span className="bg-gradient-to-r from-pink-500 to-violet-600 bg-clip-text text-transparent block">
                Compartilhe
              </span>
            </h1>

            <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed">
              Una-se à nossa comunidade de cinéfilos e seriados. Avalie seus
              filmes e séries favoritos, descubra novas obras e conecte-se com
              pessoas que compartilham seus gostos.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 text-white font-medium px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isAuthenticated ? "Ir para Dashboard" : "Começar Agora"}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="border-slate-600 text-slate-300 hover:bg-slate-800/50 backdrop-blur-sm px-8 py-3"
              >
                <Play className="w-5 h-5 mr-2" />
                Ver Demo
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Sistema de Avaliação
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  Avalie filmes e séries com nosso sistema de estrelas de 0 a
                  10. Deixe comentários e acompanhe suas avaliações.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Lista de Favoritos
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  Mantenha uma lista personalizada de seus filmes e séries
                  favoritos. Organize e acesse facilmente suas obras preferidas.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Descoberta
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  Explore filmes populares, em cartaz, mais bem avaliados e em
                  breve. Descubra novas obras baseadas em diferentes categorias.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Statistics */}
          <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-slate-600/50 backdrop-blur-sm rounded-2xl p-8 mb-16">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-white mb-2">10k+</div>
                <div className="text-slate-400">Filmes Disponíveis</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-2">5k+</div>
                <div className="text-slate-400">Séries Disponíveis</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-2">50k+</div>
                <div className="text-slate-400">Avaliações Feitas</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-2">1k+</div>
                <div className="text-slate-400">Usuários Ativos</div>
              </div>
            </div>
          </div>

          {/* CTA Final */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Pronto para começar sua jornada?
            </h2>
            <p className="text-slate-400 mb-8 max-w-xl mx-auto">
              Junte-se à nossa comunidade e comece a descobrir, avaliar e
              compartilhar suas obras favoritas hoje mesmo.
            </p>
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 text-white font-medium px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isAuthenticated ? "Acessar Dashboard" : "Criar Conta Grátis"}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-700/50 bg-slate-900/50 backdrop-blur-sm mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-violet-600 rounded-lg flex items-center justify-center">
                <Film className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-semibold">LMS Films</span>
            </div>
            <div className="text-slate-400 text-sm text-center md:text-right">
              <p>&copy; 2024 LMS Films. Todos os direitos reservados.</p>
              <p className="mt-1">
                Dados de filmes e séries fornecidos pela API do TMDB
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
