import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import getIcon from '../utils/iconUtils';

const AlertTriangleIcon = getIcon('AlertTriangle');
const HomeIcon = getIcon('Home');

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-surface-50 dark:bg-surface-900">
      <motion.div 
        className="card neu-shadow max-w-md w-full mx-auto text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-center mb-6">
          <AlertTriangleIcon className="w-16 h-16 text-secondary" />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-gradient">404</h1>
        <h2 className="text-xl md:text-2xl font-bold mb-4">Page Not Found</h2>
        
        <p className="text-surface-600 dark:text-surface-300 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <Link 
          to="/" 
          className="btn-primary inline-flex items-center justify-center gap-2"
        >
          <HomeIcon className="w-5 h-5" />
          <span>Back to Home</span>
        </Link>
      </motion.div>
    </div>
  );
}

export default NotFound;