import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/lib/auth';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PromotionModal } from '@/components/PromotionModal';
import { HomePage } from '@/pages/HomePage';
import { CoursesPage, CategoriesPage, CategoryPage } from '@/pages/CoursesPage';
import { CourseDetailPage } from '@/pages/CourseDetailPage';
import { AuthPage } from '@/pages/AuthPage';
import { BookmarksPage } from '@/pages/BookmarksPage';
import { AdminLoginPage } from '@/pages/AdminLoginPage';
import { AdminPage } from '@/pages/AdminPage';

function AppContent() {
  const [promoOpen, setPromoOpen] = useState(false);
  const openPromo = () => setPromoOpen(true);

  const hideChrome = window.location.pathname.startsWith('/admin/login');

  return (
    <>
      <AnimatedBackground />
      {!hideChrome && <Navbar onPromoteClick={openPromo} />}
      <Routes>
        <Route path="/" element={<HomePage onPromoteClick={openPromo} />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/course/:slug" element={<CourseDetailPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/bookmarks" element={<BookmarksPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<HomePage onPromoteClick={openPromo} />} />
      </Routes>
      {!hideChrome && <Footer onPromoteClick={openPromo} />}
      <PromotionModal open={promoOpen} onClose={() => setPromoOpen(false)} />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
