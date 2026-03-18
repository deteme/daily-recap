const LoadingSpinner = ({ size = 'medium' }) => {
  const sizes = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  return (
    <div className={`${sizes[size]} border-2 border-indigo-600 border-t-transparent rounded-full animate-spin`}></div>
  );
};

export default LoadingSpinner;