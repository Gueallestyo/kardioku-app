import { useState, useEffect, useCallback } from 'react';
import { Newspaper, Heart, Stethoscope, Calendar, Globe, ExternalLink, ArrowRight, Loader2, RefreshCw } from 'lucide-react';

type NewsCategory = 'Semua' | 'Latest News' | 'Heart Health Tips' | 'Research Updates';

interface NewsArticle {
  id: string;
  category: NewsCategory;
  title: string;
  summary: string;
  source: string;
  date: string;
  imageUrl: string;
  url: string;
}

// DUMMY DATA: Tautan (#) sudah diperbaiki menjadi tautan berita/edukasi medis asli
const DUMMY_NEWS: NewsArticle[] = [
  {
    id: '1',
    category: 'Latest News',
    title: 'Pusat Informasi Penyakit Kardiovaskular - WHO',
    summary: 'Organisasi Kesehatan Dunia (WHO) memberikan pedoman komprehensif terkait penanganan dan pencegahan risiko penyakit jantung secara global.',
    source: 'World Health Organization',
    date: 'Hari ini',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800',
    url: 'https://www.who.int/health-topics/cardiovascular-diseases'
  },
  {
    id: '2',
    category: 'Heart Health Tips',
    title: 'Mengenal Penyakit Jantung: Gejala, Penyebab, dan Pencegahan',
    summary: 'Informasi medis terpercaya mengenai kebiasaan sehari-hari yang dapat membantu menurunkan lonjakan tekanan darah dan menjaga jantung Anda.',
    source: 'Alodokter',
    date: 'Hari ini',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800',
    url: 'https://www.alodokter.com/penyakit-jantung'
  }
];

export default function NewsTab() {
  const [activeCategory, setActiveCategory] = useState<NewsCategory>('Semua');
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false); // State khusus untuk tombol Refresh

  // FUNGSI MESIN PENCARI BERITA OTOMATIS
  const fetchNews = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      // ⚠️ GANTI TEKS DI BAWAH INI DENGAN API KEY DARI GNEWS.IO ANDA
      const API_KEY = '86164a87d789a260e5f5840474cb3bc7'; 
      
      const response = await fetch(`https://gnews.io/api/v4/search?q=jantung+OR+kardiovaskular+OR+kolesterol&lang=id&max=10&apikey=${API_KEY}`);
      const data = await response.json();

      // Jika API menolak (misal: API key salah atau limit harian habis)
      if (data.errors || !response.ok) {
        console.warn("Peringatan API GNews:", data.errors || "Koneksi gagal");
        setArticles(DUMMY_NEWS);
        return;
      }

      if (data.articles && data.articles.length > 0) {
        const fetchedNews: NewsArticle[] = data.articles.map((item: any, index: number) => {
          const dateObj = new Date(item.publishedAt);
          const formattedDate = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

          const titleLower = item.title.toLowerCase();
          let cat: NewsCategory = 'Latest News';
          if (titleLower.includes('tips') || titleLower.includes('cara') || titleLower.includes('hindari')) cat = 'Heart Health Tips';
          else if (titleLower.includes('studi') || titleLower.includes('penelitian') || titleLower.includes('ilmuwan')) cat = 'Research Updates';

          return {
            id: `api-${index}`,
            category: cat,
            title: item.title,
            summary: item.description,
            source: item.source.name,
            date: formattedDate,
            imageUrl: item.image || 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&q=80&w=800',
            url: item.url
          };
        });
        setArticles(fetchedNews);
      } else {
        setArticles(DUMMY_NEWS);
      }
    } catch (error) {
      console.error("Gagal mengambil berita:", error);
      setArticles(DUMMY_NEWS);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Panggil saat pertama kali tab dibuka
  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const filteredNews = activeCategory === 'Semua' 
    ? articles 
    : articles.filter(news => news.category === activeCategory);

  const getCategoryIcon = (category: NewsCategory) => {
    switch (category) {
      case 'Latest News': return <Newspaper className="w-4 h-4" />;
      case 'Heart Health Tips': return <Heart className="w-4 h-4" />;
      case 'Research Updates': return <Stethoscope className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6 pb-6 animate-fade-in">
      
      {/* HEADER SECTION DENGAN TOMBOL REFRESH */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm relative overflow-hidden">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Newspaper className="w-6 h-6 text-primary" />
              Edukasi & Berita
            </h2>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed pr-10">
              Pusat informasi Kardioku. Temukan berita terbaru, tips kesehatan, dan riset medis terkini.
            </p>
          </div>
          
          {/* TOMBOL REFRESH BARU */}
          <button 
            onClick={() => fetchNews(true)}
            disabled={isRefreshing || isLoading}
            className="p-2.5 bg-secondary hover:bg-primary/10 text-primary rounded-xl border border-primary/20 transition-all flex-shrink-0 disabled:opacity-50"
            title="Muat ulang berita"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* CATEGORY FILTER BUTTONS */}
      <div className="flex overflow-x-auto pb-2 -mx-2 px-2 gap-2 snap-x scrollbar-hide">
        {(['Semua', 'Latest News', 'Heart Health Tips', 'Research Updates'] as NewsCategory[]).map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`snap-center flex items-center gap-2 whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
              activeCategory === category
                ? 'bg-primary text-white shadow-md shadow-primary/20 scale-105'
                : 'bg-card text-muted-foreground border border-border hover:bg-muted hover:text-foreground'
            }`}
          >
            {getCategoryIcon(category)}
            {category}
          </button>
        ))}
      </div>

      {/* NEWS CARDS LIST */}
      <div className="space-y-5">
        {isLoading && !isRefreshing ? (
          <div className="text-center py-12 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground text-sm font-medium animate-pulse">Mengambil berita kesehatan terbaru...</p>
          </div>
        ) : filteredNews.length > 0 ? (
          filteredNews.map((article) => (
            <div 
              key={article.id} 
              className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer"
              onClick={() => window.open(article.url, '_blank')}
            >
              <div className="flex flex-col md:flex-row">
                <div className="relative w-full h-48 md:w-40 md:h-auto overflow-hidden">
                  <div className="absolute inset-0 bg-primary/10 z-10 group-hover:bg-transparent transition-colors duration-300"></div>
                  <img 
                    src={article.imageUrl} 
                    alt={article.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&q=80&w=800';
                    }}
                  />
                  <div className="absolute top-3 left-3 z-20 bg-background/90 backdrop-blur-sm text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm border border-border/50 text-foreground">
                    {getCategoryIcon(article.category)}
                    {article.category}
                  </div>
                </div>

                <div className="p-4 md:p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2.5 font-medium">
                      <span className="flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5" /> {article.source}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-border"></span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> {article.date}
                      </span>
                    </div>

                    <h3 className="text-base md:text-lg font-bold text-foreground leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 md:line-clamp-3 leading-relaxed">
                      {article.summary}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between pt-3 border-t border-border/50">
                    <span className="text-xs font-semibold text-primary flex items-center gap-1 group-hover:underline">
                      Baca selengkapnya <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                    </span>
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10">
            <Newspaper className="w-12 h-12 text-muted mx-auto mb-3" />
            <p className="text-muted-foreground">Tidak ada berita untuk kategori ini.</p>
          </div>
        )}
      </div>

    </div>
  );
}