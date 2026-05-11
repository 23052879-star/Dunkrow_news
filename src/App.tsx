import React, { useEffect } from 'react';
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

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageArticles from './pages/admin/ManageArticles';
import ManageComments from './pages/admin/ManageComments';
import ManageUsers from './pages/admin/ManageUsers';
import ManageWhispers from './pages/admin/ManageWhispers';
import ManageJokesTrivia from './pages/admin/ManageJokesTrivia';
import ManageNewsletterSubscriptions from './pages/admin/ManageNewsletterSubscriptions';

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <ScrollToTop />
            <Routes>
            <Route path="/" element={<Layout />}>
              {/* Public routes */}
              <Route index element={<HomePage />} />
              <Route path="article/:slug" element={<ArticleDetailPage />} />
              <Route path="category/:slug" element={<CategoryPage />} />
              <Route path="whispers" element={<WhispersPage />} />
              <Route path="jokes-trivia" element={<JokesTriviasPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              
              {/* Protected routes */}
              <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              
              {/* Protected admin routes */}
              <Route path="admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="admin/articles" element={<AdminRoute><ManageArticles /></AdminRoute>} />
              <Route path="admin/comments" element={<AdminRoute><ManageComments /></AdminRoute>} />
              <Route path="admin/users" element={<AdminRoute><ManageUsers /></AdminRoute>} />
              <Route path="admin/whispers" element={<AdminRoute><ManageWhispers /></AdminRoute>} />
              <Route path="admin/jokes-trivia" element={<AdminRoute><ManageJokesTrivia /></AdminRoute>} />
              <Route path="admin/newsletter" element={<AdminRoute><ManageNewsletterSubscriptions /></AdminRoute>} />
              
              {/* 404 page */}
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