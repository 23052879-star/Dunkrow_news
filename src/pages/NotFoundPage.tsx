import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FileQuestion, Home } from 'lucide-react';
import Button from '../components/ui/Button';

const NotFoundPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Page Not Found | Dunkrow</title>
        <meta name="description" content="The page you are looking for could not be found." />
      </Helmet>

      <div className="max-w-md mx-auto text-center py-16">
        <FileQuestion size={80} className="mx-auto text-primary-600 mb-6" />
        
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
          Page Not Found
        </h1>
        
        <p className="text-neutral-600 dark:text-neutral-400 mb-8">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        
        <Link to="/">
          <Button leftIcon={<Home size={16} />}>
            Back to Home
          </Button>
        </Link>
      </div>
    </>
  );
};

export default NotFoundPage;