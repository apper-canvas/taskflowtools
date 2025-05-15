import { useState } from 'react';
import { motion } from 'framer-motion';
import getIcon from '../utils/iconUtils';
import MainFeature from '../components/MainFeature';

// Declare icon components
const MoonIcon = getIcon('Moon');
const SunIcon = getIcon('Sun');
const CheckCircleIcon = getIcon('CheckCircle');

function Home({ darkMode, toggleDarkMode }) {
  const [taskStats, setTaskStats] = useState({
    total: 0,
    completed: 0
  });

  // Update task stats when tasks change
  const updateTaskStats = (total, completed) => {
    setTaskStats({ total, completed });
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-surface-800 shadow-md dark:shadow-neu-dark">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <motion.div 
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              className="text-primary"
            >
              <CheckCircleIcon className="w-8 h-8" />
            </motion.div>
            <h1 className="text-2xl font-bold text-gradient">TaskFlow</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative rounded-full p-1 bg-surface-200 dark:bg-surface-700 w-16 h-8 flex">
              <button 
                onClick={toggleDarkMode}
                className="relative z-10 w-full h-full flex items-center justify-center"
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {darkMode ? (
                  <SunIcon className="w-5 h-5 text-yellow-300" />
                ) : (
                  <MoonIcon className="w-5 h-5 text-purple-500" />
                )}
              </button>
              <motion.div 
                className="absolute top-1 h-6 w-6 rounded-full bg-white dark:bg-surface-800 shadow-sm"
                animate={{ left: darkMode ? "calc(100% - 1.75rem)" : "0.25rem" }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        {/* Task Stats */}
        <motion.div 
          className="mb-8 grid grid-cols-2 gap-4 md:gap-6 md:flex md:justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="card neu-shadow flex flex-col items-center py-6">
            <h3 className="text-xl md:text-2xl font-bold text-primary">{taskStats.total}</h3>
            <p className="text-sm md:text-base text-surface-500">Total Tasks</p>
          </div>
          <div className="card neu-shadow flex flex-col items-center py-6">
            <h3 className="text-xl md:text-2xl font-bold text-secondary">{taskStats.completed}</h3>
            <p className="text-sm md:text-base text-surface-500">Completed Tasks</p>
          </div>
        </motion.div>
        
        <MainFeature onTasksChange={updateTaskStats} />
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 bg-surface-100 dark:bg-surface-800">
        <div className="container mx-auto px-4 text-center text-surface-500">
          <p>© {new Date().getFullYear()} TaskFlow. Simplify your productivity.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;