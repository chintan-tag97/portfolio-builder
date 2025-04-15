const AnimatedBackground = () => {
  return (
    <>
      {/* Top left purple pulse */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-purple-100/50 dark:bg-purple-900/10 rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
      
      {/* Bottom right indigo pulse */}
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-indigo-100/50 dark:bg-indigo-900/10 rounded-full translate-x-1/4 translate-y-1/4 animate-pulse"></div>
      
      {/* Center right pink ping */}
      <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-pink-100/50 dark:bg-pink-900/10 rounded-full animate-ping"></div>
      
      {/* Top left purple bounce-in */}
      <div className="absolute top-1/4 left-1/4 w-16 h-16 bg-purple-200/30 dark:bg-purple-800/10 rounded-full animate-bounce-in"></div>
      
      {/* Bottom right indigo bounce */}
      <div className="absolute bottom-1/4 right-1/3 w-20 h-20 bg-indigo-200/30 dark:bg-indigo-800/10 rounded-full animate-bounce"></div>
    </>
  );
};

export default AnimatedBackground; 