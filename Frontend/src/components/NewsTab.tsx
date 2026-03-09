import { useState, useEffect } from 'react';
import { Newspaper, Heart, Stethoscope, Calendar, Globe, ExternalLink, ArrowRight, Loader2 } from 'lucide-react';

// 1. Kategori sudah diubah menjadi Bahasa Indonesia
type NewsCategory = 'Semua' | 'Berita Terbaru' | 'Tips Jantung Sehat' | 'Update Riset';

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

// 2. DUMMY DATA Diperbanyak menjadi 7 Berita dengan Tautan Asli
const DUMMY_NEWS: NewsArticle[] = [
  // --- BERITA TERBARU (3 Artikel) ---
  {
    id: '1',
    category: 'Berita Terbaru',
    title: 'Pusat Informasi Penyakit Kardiovaskular - WHO',
    summary: 'Organisasi Kesehatan Dunia (WHO) memberikan pedoman komprehensif terkait penanganan dan pencegahan risiko penyakit jantung secara global.',
    source: 'World Health Organization',
    date: 'Hari ini',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800',
    url: 'https://www.who.int/health-topics/cardiovascular-diseases'
  },
  {
    id: '2',
    category: 'Berita Terbaru',
    title: 'Kemenkes Imbau Masyarakat Cek Kolesterol Rutin Sejak Usia Muda',
    summary: 'Kementerian Kesehatan mengingatkan bahwa serangan jantung kini makin banyak menyerang usia produktif akibat gaya hidup sedentari dan pola makan tidak sehat.',
    source: 'Kemenkes RI',
    date: 'Kemarin',
    imageUrl: 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=crop&q=80&w=800',
    url: 'https://ayosehat.kemkes.go.id/'
  },
  {
    id: '3',
    category: 'Berita Terbaru',
    title: 'Waspada, Polusi Udara Tingkatkan Risiko Serangan Jantung',
    summary: 'Paparan polusi udara jangka panjang terbukti dapat merusak pembuluh darah dan mempercepat pembentukan plak pada arteri jantung.',
    source: 'Halodoc',
    date: 'Kemarin',
    imageUrl: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?auto=format&fit=crop&q=80&w=800',
    url: 'https://www.halodoc.com/artikel/kesehatan-jantung'
  },

  // --- TIPS JANTUNG SEHAT (2 Artikel) ---
  {
    id: '4',
    category: 'Tips Jantung Sehat',
    title: 'Mengenal Penyakit Jantung: Gejala, Penyebab, dan Pencegahan',
    summary: 'Informasi medis terpercaya mengenai kebiasaan sehari-hari yang dapat membantu menurunkan lonjakan tekanan darah dan menjaga jantung Anda.',
    source: 'Alodokter',
    date: 'Hari ini',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800',
    url: 'https://www.alodokter.com/penyakit-jantung'
  },
  {
    id: '5',
    category: 'Tips Jantung Sehat',
    title: '5 Olahraga Ringan yang Aman dan Baik untuk Penderita Hipertensi',
    summary: 'Tidak semua olahraga cocok untuk penderita darah tinggi. Jalan kaki, berenang, dan bersepeda santai adalah pilihan terbaik untuk melatih otot jantung tanpa membebaninya.',
    source: 'KlikDokter',
    date: '3 Hari yang lalu',
    imageUrl: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=800',
    url: 'https://www.klikdokter.com/info-sehat/jantung'
  },

  // --- UPDATE RISET (2 Artikel) ---
  {
    id: '6',
    category: 'Update Riset',
    title: 'Studi Terbaru: Hubungan Pola Tidur dengan Irama Jantung Terganggu',
    summary: 'Penelitian terbaru menunjukkan bahwa individu yang tidur kurang dari 6 jam atau lebih dari 9 jam sehari memiliki risiko lebih tinggi terkena aritmia jantung.',
    source: 'American Heart Association',
    date: 'Minggu lalu',
    imageUrl: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=800',
    url: 'https://www.heart.org/'
  },
  {
    id: '7',
    category: 'Update Riset',
    title: 'Inovasi Medis: AI Kini Bantu Dokter Deteksi Dini Penyakit Jantung',
    summary: 'Teknologi kecerdasan buatan (Machine Learning) kini semakin akurat dalam memprediksi risiko penyakit kardiovaskular melalui rekam medis dan data EKG pasien.',
    source: 'Medical News Today',
    date: 'Bulan lalu',
    imageUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&q=80&w=800',
    url: 'https://www.medicalnewstoday.com/categories/heart-disease'
  }
];

export default function NewsTab() {
  const [activeCategory, setActiveCategory] = useState<NewsCategory>('Semua');
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // FUNGSI MESIN PENCARI BERITA OTOMATIS
  useEffect(() => {
    const fetchNews = async () => {
      setIsLoading(true);
      try {
        // ⚠️ PENTING: GANTI DENGAN API KEY GNEWS ANDA UNTUK MENDAPATKAN BERITA BARU SETIAP HARI
        const API_KEY = '86164a87d789a260e5f5840474cb3bc7'; 
        
        // Memanggil API (Otomatis dipanggil setiap tab Berita dibuka)
        const response = await fetch(`https://gnews.io/api/v4/search?q=jantung+OR+kardiovaskular+OR+kolesterol&lang=id&max=10&apikey=${API_KEY}`);
        const data = await response.json();

        // Jika API menolak (misal: API key belum diisi atau limit harian habis)
        if (data.errors || !response.ok) {
          console.warn("Sistem menggunakan berita cadangan (Fallback) karena:", data.errors || "Koneksi gagal");
          setArticles(DUMMY_NEWS);
          return;
        }

        if (data.articles && data.articles.length > 0) {
          const fetchedNews: NewsArticle[] = data.articles.map((item: any, index: number) => {
            const dateObj = new Date(item.publishedAt);
            const formattedDate = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

            const titleLower = item.title.toLowerCase();
            let cat: NewsCategory = 'Berita Terbaru';
            if (titleLower.includes('tips') || titleLower.includes('cara') || titleLower.includes('hindari') || titleLower.includes('makanan') || titleLower.includes('olahraga')) {
              cat = 'Tips Jantung Sehat';
            } else if (titleLower.includes('studi') || titleLower.includes('penelitian') || titleLower.includes('ilmuwan') || titleLower.includes('riset') || titleLower.includes('penemuan')) {
              cat = 'Update Riset';
            }

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
        console.error("Gagal mengambil berita asli:", error);
        setArticles(DUMMY_NEWS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, []); // Array kosong [] artinya fetchNews otomatis dipanggil saat halaman ini dibuka

  const filteredNews = activeCategory === 'Semua' 
    ? articles 
    : articles.filter(news => news.category === activeCategory);

  const getCategoryIcon = (category: NewsCategory) => {
    switch (category) {
      case 'Berita Terbaru': return <Newspaper className="w-4 h-4" />;
      case 'Tips Jantung Sehat': return <Heart className="w-4 h-4" />;
      case 'Update Riset': return <Stethoscope className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6 pb-6 animate-fade-in">
      
      {/* HEADER SECTION DENGAN DESAIN BERSIH */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm relative overflow-hidden">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-primary" />
            Edukasi & Berita
          </h2>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            Pusat informasi Kardioku. Temukan berita terbaru, tips kesehatan, dan riset medis terkini.
          </p>
        </div>
      </div>

      {/* CATEGORY FILTER BUTTONS */}
      <div className="flex overflow-x-auto pb-2 -mx-2 px-2 gap-2 snap-x scrollbar-hide">
        {(['Semua', 'Berita Terbaru', 'Tips Jantung Sehat', 'Update Riset'] as NewsCategory[]).map((category) => (
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
        {isLoading ? (
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