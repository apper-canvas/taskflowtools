import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import getIcon from '../utils/iconUtils';

// Declare icon components
const PlusIcon = getIcon('Plus');
const ClipboardListIcon = getIcon('ClipboardList');
const CheckIcon = getIcon('Check');
const CircleIcon = getIcon('Circle');
const EditIcon = getIcon('Edit');
const TrashIcon = getIcon('Trash');
const CalendarIcon = getIcon('Calendar');
const AlertCircleIcon = getIcon('AlertCircle');
const ArrowUpIcon = getIcon('ArrowUp');
const ArrowDownIcon = getIcon('ArrowDown');
const XIcon = getIcon('X');

// Priority badge component
function PriorityBadge({ priority }) {
  const getPriorityColor = () => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-surface-100 text-surface-800 dark:bg-surface-700 dark:text-surface-200';
    }
  };

  const getPriorityIcon = () => {
    switch (priority) {
      case 'high':
        return <ArrowUpIcon className="w-3.5 h-3.5" />;
      case 'medium':
        return <AlertCircleIcon className="w-3.5 h-3.5" />;
      case 'low':
        return <ArrowDownIcon className="w-3.5 h-3.5" />;
      default:
        return null;
    }
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor()}`}>
      {getPriorityIcon()}
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
}

function MainFeature({ onTasksChange }) {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });
  
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    listId: 'default'
  });
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [formErrors, setFormErrors] = useState({});

  // Update localStorage when tasks change
  useEffect(() => {
    // Only save to localStorage when tasks actually change
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Update task stats in parent component separately to avoid dependency issues
  useEffect(() => {
    // Update task stats in parent component
    const completedTasks = tasks.filter(task => task.completed).length;
    onTasksChange(tasks.length, completedTasks);
    // Only include onTasksChange since it should now be stable with useCallback
  }, [tasks, onTasksChange]); 

  // Load task being edited into form
  useEffect(() => {
    if (editingTaskId) {
      const taskToEdit = tasks.find(task => task.id === editingTaskId);
      if (taskToEdit) {
        setNewTask({
          title: taskToEdit.title,
          description: taskToEdit.description || '',
          dueDate: taskToEdit.dueDate || '',
          priority: taskToEdit.priority || 'medium',
          listId: taskToEdit.listId || 'default'
        });
        setIsFormOpen(true);
      }
    }
  }, [editingTaskId, tasks]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!newTask.title.trim()) {
      errors.title = "Title is required";
    }
    
    if (newTask.dueDate && new Date(newTask.dueDate) < new Date().setHours(0, 0, 0, 0)) {
      errors.dueDate = "Due date cannot be in the past";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Add or update a task
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (editingTaskId) {
      // Update existing task
      const updatedTasks = tasks.map(task => 
        task.id === editingTaskId 
          ? { 
              ...task, 
              title: newTask.title,
              description: newTask.description,
              dueDate: newTask.dueDate,
              priority: newTask.priority,
              listId: newTask.listId,
              updatedAt: new Date().toISOString()
            } 
          : task
      );
      
      setTasks(updatedTasks);
      toast.success("Task updated successfully!");
    } else {
      // Add new task
      const newTaskObject = {
        id: Date.now().toString(),
        title: newTask.title,
        description: newTask.description,
        dueDate: newTask.dueDate,
        priority: newTask.priority,
        listId: newTask.listId,
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setTasks([...tasks, newTaskObject]);
      toast.success("New task added!");
    }
    
    // Reset form
    setNewTask({
      title: '',
      description: '',
      dueDate: '',
      priority: 'medium',
      listId: 'default'
    });
    setEditingTaskId(null);
    setIsFormOpen(false);
    setFormErrors({});
  };

  // Toggle task completion status
  const toggleTaskStatus = (id) => {
    const updatedTasks = tasks.map(task => 
      task.id === id 
        ? { ...task, completed: !task.completed, updatedAt: new Date().toISOString() } 
        : task
    );
    
    setTasks(updatedTasks);
    
    const taskName = tasks.find(t => t.id === id).title;
    const isNowCompleted = !tasks.find(t => t.id === id).completed;
    
    if (isNowCompleted) {
      toast.success(`Task "${taskName}" completed! 🎉`);
    }
  };

  // Delete a task
  const deleteTask = (id) => {
    const taskToDelete = tasks.find(task => task.id === id);
    if (!taskToDelete) return;
    
    setTasks(tasks.filter(task => task.id !== id));
    toast.success(`Task "${taskToDelete.title}" deleted`);
  };

  // Edit a task
  const startEditingTask = (id) => {
    setEditingTaskId(id);
  };

  // Cancel editing/adding task
  const cancelForm = () => {
    setIsFormOpen(false);
    setEditingTaskId(null);
    setNewTask({
      title: '',
      description: '',
      dueDate: '',
      priority: 'medium',
      listId: 'default'
    });
    setFormErrors({});
  };

  // Filter tasks based on selected filter
  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'completed') return task.completed;
    if (filter === 'active') return !task.completed;
    return true;
  });

  // Format date to be more readable
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  // Check if a task is overdue (due date passed but not completed)
  const isTaskOverdue = (task) => {
    if (!task.dueDate || task.completed) return false;
    
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(23, 59, 59, 999); // End of the due date
    
    return dueDate < new Date();
  };

  return (
    <div className="relative">
      {/* Task List Card */}
      <motion.div 
        className="card neu-shadow mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <ClipboardListIcon className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold">My Tasks</h2>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {/* Filter buttons */}
            <div className="flex overflow-hidden rounded-lg bg-surface-100 dark:bg-surface-700 text-sm">
              <button 
                className={`px-3 py-1.5 ${filter === 'all' ? 'bg-primary text-white' : 'text-surface-600 dark:text-surface-300'}`}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button 
                className={`px-3 py-1.5 ${filter === 'active' ? 'bg-primary text-white' : 'text-surface-600 dark:text-surface-300'}`}
                onClick={() => setFilter('active')}
              >
                Active
              </button>
              <button 
                className={`px-3 py-1.5 ${filter === 'completed' ? 'bg-primary text-white' : 'text-surface-600 dark:text-surface-300'}`}
                onClick={() => setFilter('completed')}
              >
                Completed
              </button>
            </div>
            
            {/* Add Task Button */}
            <button 
              className="btn-primary flex items-center gap-1.5 py-1.5"
              onClick={() => setIsFormOpen(true)}
            >
              <PlusIcon className="w-4 h-4" />
              <span>Add Task</span>
            </button>
          </div>
        </div>
        
        {/* Tasks container with animation */}
        <div className="space-y-3">
          <AnimatePresence>
            {filteredTasks.length > 0 ? (
              filteredTasks.map(task => (
                <motion.div 
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className={`task-item card p-4 ${task.completed ? 'bg-surface-50/80 dark:bg-surface-800/50' : ''} 
                              ${isTaskOverdue(task) ? 'border-l-4 border-red-500' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <button 
                      onClick={() => toggleTaskStatus(task.id)}
                      className={`mt-0.5 flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center border-2 
                                  ${task.completed 
                                    ? 'bg-primary border-primary text-white' 
                                    : 'border-surface-300 dark:border-surface-600'}`}
                      aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
                    >
                      {task.completed ? <CheckIcon className="w-4 h-4" /> : null}
                    </button>
                    
                    {/* Task content */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h3 className={`text-lg font-medium ${task.completed ? 'line-through text-surface-400 dark:text-surface-500' : ''}`}>
                          {task.title}
                        </h3>
                        
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Priority badge */}
                          <PriorityBadge priority={task.priority} />
                          
                          {/* Action buttons */}
                          <div className="flex gap-1">
                            <button 
                              onClick={() => startEditingTask(task.id)}
                              className="p-1.5 rounded-full text-surface-500 hover:bg-surface-100 hover:text-primary dark:hover:bg-surface-700"
                              aria-label="Edit task"
                            >
                              <EditIcon className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => deleteTask(task.id)}
                              className="p-1.5 rounded-full text-surface-500 hover:bg-surface-100 hover:text-secondary dark:hover:bg-surface-700"
                              aria-label="Delete task"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Description if available */}
                      {task.description && (
                        <p className={`mt-1 text-sm text-surface-600 dark:text-surface-400 ${task.completed ? 'text-surface-400 dark:text-surface-500' : ''}`}>
                          {task.description}
                        </p>
                      )}
                      
                      {/* Due date if available */}
                      {task.dueDate && (
                        <div className={`mt-2 flex items-center gap-1.5 text-xs ${
                          isTaskOverdue(task) 
                            ? 'text-red-600 dark:text-red-400' 
                            : 'text-surface-500 dark:text-surface-400'
                        }`}>
                          <CalendarIcon className="w-3.5 h-3.5" />
                          <span>Due: {formatDate(task.dueDate)}</span>
                          {isTaskOverdue(task) && <span className="font-medium">Overdue!</span>}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-12 text-center"
              >
                <ClipboardListIcon className="w-12 h-12 mx-auto mb-4 text-surface-300 dark:text-surface-600" />
                <h3 className="text-lg font-medium text-surface-600 dark:text-surface-400">No tasks found</h3>
                <p className="text-surface-500 dark:text-surface-500 mt-1">
                  {filter === 'all' 
                    ? "You haven't created any tasks yet"
                    : filter === 'completed'
                      ? "You haven't completed any tasks yet"
                      : "You don't have any active tasks"}
                </p>
                <button 
                  className="mt-4 btn-primary"
                  onClick={() => setIsFormOpen(true)}
                >
                  Create your first task
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
      
      {/* Task Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50"
            onClick={cancelForm}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="card neu-shadow max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{editingTaskId ? 'Edit Task' : 'Add New Task'}</h2>
                <button 
                  onClick={cancelForm}
                  className="p-1.5 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500"
                  aria-label="Close form"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title field */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium mb-1 text-surface-700 dark:text-surface-300">
                    Task title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={newTask.title}
                    onChange={handleInputChange}
                    className={`input-field ${formErrors.title ? 'border-red-500 dark:border-red-500' : ''}`}
                    placeholder="What needs to be done?"
                  />
                  {formErrors.title && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.title}</p>
                  )}
                </div>
                
                {/* Description field */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-1 text-surface-700 dark:text-surface-300">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={newTask.description}
                    onChange={handleInputChange}
                    className="input-field min-h-[80px]"
                    placeholder="Add details about this task (optional)"
                  ></textarea>
                </div>
                
                {/* Due date field */}
                <div>
                  <label htmlFor="dueDate" className="block text-sm font-medium mb-1 text-surface-700 dark:text-surface-300">
                    Due date
                  </label>
                  <input
                    type="date"
                    id="dueDate"
                    name="dueDate"
                    value={newTask.dueDate}
                    onChange={handleInputChange}
                    className={`input-field ${formErrors.dueDate ? 'border-red-500 dark:border-red-500' : ''}`}
                  />
                  {formErrors.dueDate && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.dueDate}</p>
                  )}
                </div>
                
                {/* Priority selection */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-surface-700 dark:text-surface-300">
                    Priority
                  </label>
                  <div className="flex flex-wrap gap-3">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="priority"
                        value="low"
                        checked={newTask.priority === "low"}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 cursor-pointer
                                       ${newTask.priority === 'low' 
                                         ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                         : 'border-surface-200 dark:border-surface-700'}`}>
                        <ArrowDownIcon className="w-4 h-4" />
                        Low
                      </span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="priority"
                        value="medium"
                        checked={newTask.priority === "medium"}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 cursor-pointer
                                       ${newTask.priority === 'medium' 
                                         ? 'border-yellow-500 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' 
                                         : 'border-surface-200 dark:border-surface-700'}`}>
                        <AlertCircleIcon className="w-4 h-4" />
                        Medium
                      </span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="priority"
                        value="high"
                        checked={newTask.priority === "high"}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 cursor-pointer
                                       ${newTask.priority === 'high' 
                                         ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                                         : 'border-surface-200 dark:border-surface-700'}`}>
                        <ArrowUpIcon className="w-4 h-4" />
                        High
                      </span>
                    </label>
                  </div>
                </div>
                
                {/* Form actions */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={cancelForm}
                    className="btn border border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    {editingTaskId ? 'Save Changes' : 'Add Task'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MainFeature;