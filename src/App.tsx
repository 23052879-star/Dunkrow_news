import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import { ThemeProvider } from './contexts/ThemeContext';
import ScrollToTop from './components/layout/ScrollToTop';

// Public pages
import HomePage from './pages/HomePage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import WhispersPage from './pages/WhispersPage';
import JokesTriviasPage from './pages/JokesTriviasPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import CategoryPage from './pages/CategoryPage';

// Admin layout & dashboard
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageArticles from './pages/admin/ManageArticles';
import ArticleEditor from './pages/admin/ArticleEditor';
import ManageComments from './pages/admin/ManageComments';
import ManageUsers from './pages/admin/ManageUsers';
import ManageWhispers from './pages/admin/ManageWhispers';
import ManageJokesTrivia from './pages/admin/ManageJokesTrivia';
import ManageNewsletterSubscriptions from './pages/admin/ManageNewsletterSubscriptions';

// New Admin pages
import ManageSections from './pages/admin/ManageSections';
import MediaLibrary from './pages/admin/MediaLibrary';
import ManagePolls from './pages/admin/ManagePolls';
import ManageAds from './pages/admin/ManageAds';
import AnalyticsDashboard from './pages/admin/AnalyticsDashboard';
import SEOSettings from './pages/admin/SEOSettings';
import HomepageBuilder from './pages/admin/HomepageBuilder';

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <ScrollToTop />
            <Routes>
              {/* Public layout routes */}
              <Route path="/" element={<Layout />}>
                {/* Public routes */}
                <Route index element={<HomePage />} />
                <Route path="article/:slug" element={<ArticleDetailPage />} />
                <Route path="category/:slug" element={<CategoryPage />} />
                <Route path="whispers" element={<WhispersPage />} />
                <Route path="jokes-trivia" element={<JokesTriviasPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />

                
                {/* Protected user routes */}
                <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              </Route>

              {/* Protected admin layout routes */}
              <Route path="admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                <Route index element={<AdminDashboard />} />
                <Route path="articles" element={<ManageArticles />} />
                <Route path="articles/new" element={<ArticleEditor />} />
                <Route path="articles/edit/:id" element={<ArticleEditor />} />
                <Route path="comments" element={<ManageComments />} />
                <Route path="users" element={<ManageUsers />} />
                <Route path="whispers" element={<ManageWhispers />} />
                <Route path="jokes-trivia" element={<ManageJokesTrivia />} />
                <Route path="newsletter" element={<ManageNewsletterSubscriptions />} />
                <Route path="sections" element={<ManageSections />} />
                <Route path="media" element={<MediaLibrary />} />
                <Route path="polls" element={<ManagePolls />} />
                <Route path="ads" element={<ManageAds />} />
                <Route path="analytics" element={<AnalyticsDashboard />} />
                <Route path="seo" element={<SEOSettings />} />
                <Route path="homepage" element={<HomepageBuilder />} />
              </Route>

              {/* 404 page */}
              <Route path="*" element={<Layout />}>
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;