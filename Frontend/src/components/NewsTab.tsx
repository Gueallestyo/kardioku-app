import { useState } from 'react';
import { Newspaper, Heart, Stethoscope, Calendar, Globe, ExternalLink, ArrowRight } from 'lucide-react';

// Kategori Berita sesuai rancangan Kardioku 2.0.0
type NewsCategory = 'Semua' | 'Latest News' | 'Heart Health Tips' | 'Research Updates';

// Struktur Data untuk Kartu Berita
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

// 📰 DUMMY DATA: Berita tiruan untuk menguji tampilan UI
const DUMMY_NEWS: NewsArticle[] = [
  {
    id: '1',
    category: 'Latest News',
    title: 'WHO Rilis Pedoman Baru Penanganan Penyakit Kardiovaskular di Era Modern',
    summary: 'Organisasi Kesehatan Dunia (WHO) memperbarui pedoman penanganan risiko penyakit jantung dengan fokus pada pencegahan dini dan pemantauan digital secara real-time.',
    source: 'Medical News Today',
    date: '9 Mar 2026',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800',
    url: '#'
  },
  {
    id: '2',
    category: 'Heart Health Tips',
    title: '5 Kebiasaan Pagi yang Terbukti Menjaga Tekanan Darah Tetap Stabil',
    summary: 'Memulai hari dengan segelas air hangat dan peregangan ringan selama 10 menit dapat membantu menurunkan lonjakan tekanan darah (morning surge) yang berbahaya bagi jantung.',
    source: 'Healthline',
    date: '8 Mar 2026',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800',
    url: '#'
  },
  {
    id: '3',
    category: 'Research Updates',
    title: 'Studi Terbaru: Hubungan Antara Kualitas Tidur dan Aritmia Jantung',
    summary: 'Penelitian dari American Heart Association menemukan bahwa individu yang tidur kurang dari 6 jam sehari memiliki risiko 20% lebih tinggi mengalami gangguan irama jantung.',
    source: 'American Heart Association',
    date: '5 Mar 2026',
    imageUrl: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=800',
    url: '#'
  },
  {
    id: '4',
    category: 'Heart Health Tips',
    title: 'Diet Mediterania: Kunci Emas Menuju Jantung Kuat di Usia Lanjut',
    summary: 'Mengkonsumsi minyak zaitun, ikan laut, dan kacang-kacangan secara rutin terbukti secara klinis dapat membersihkan plak pada pembuluh darah arteri.',
    source: 'WebMD',
    date: '3 Mar 2026',
    imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800',
    url: '#'
  }
];

export default function NewsTab() {
  const [activeCategory, setActiveCategory] = useState<NewsCategory>('Semua');

  // Logika Filter Berita
  const filteredNews = activeCategory === 'Semua' 
    ? DUMMY_NEWS 
    : DUMMY_NEWS.filter(news => news.category === activeCategory);

  // Fungsi untuk mendapatkan ikon kategori
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
      
      {/* 🎯 HEADER SECTION */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Newspaper className="w-6 h-6 text-primary" />
          Edukasi & Berita
        </h2>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
          Pusat informasi Kardioku. Temukan berita terbaru, tips kesehatan, dan riset medis terkini untuk menjaga jantung Anda tetap sehat.
        </p>
      </div>

      {/* 🏷️ CATEGORY FILTER BUTTONS */}
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

      {/* 📰 NEWS CARDS LIST */}
      <div className="space-y-5">
        {filteredNews.length > 0 ? (
          filteredNews.map((article) => (
            <div 
              key={article.id} 
              className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer"
              onClick={() => window.open(article.url, '_blank')}
            >
              <div className="flex flex-col md:flex-row">
                {/* Thumbnail Image */}
                <div className="relative w-full h-48 md:w-40 md:h-auto overflow-hidden">
                  <div className="absolute inset-0 bg-primary/10 z-10 group-hover:bg-transparent transition-colors duration-300"></div>
                  <img 
                    src={article.imageUrl} 
                    alt={article.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {/* Badge Kategori Terapung */}
                  <div className="absolute top-3 left-3 z-20 bg-background/90 backdrop-blur-sm text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm border border-border/50 text-foreground">
                    {getCategoryIcon(article.category)}
                    {article.category}
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-4 md:p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Source & Date */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2.5 font-medium">
                      <span className="flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5" /> {article.source}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-border"></span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> {article.date}
                      </span>
                    </div>

                    {/* Title & Summary */}
                    <h3 className="text-base md:text-lg font-bold text-foreground leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 md:line-clamp-3 leading-relaxed">
                      {article.summary}
                    </p>
                  </div>

                  {/* Read More Footer */}
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