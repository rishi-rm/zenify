import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Menu, X, Sun, Moon } from "lucide-react";

// Available mood options for the user to select
const moods = [
  "happy",
  "sad",
  "energetic",
  "romantic",
  "chill",
  "motivational",
  "healing",
];

// Default configuration for the application
const defaultConfig = {
  site_title: "Zenify",
  tagline: "Discover music that matches your soul",
  no_mood_message: "Select a mood to discover your perfect playlist",
};

export default function App() {
  // Application configuration state
  const [config] = useState(defaultConfig);
  
  // Currently selected mood by the user
  const [currentMood, setCurrentMood] = useState(null);
  
  // List of songs fetched based on the selected mood
  const [songs, setSongs] = useState([]);
  
  // Loading state for API calls
  const [isLoading, setIsLoading] = useState(false);
  
  // Error message state
  const [error, setError] = useState(null);
  
  // Object storing liked songs with song keys as properties
  // Initialize from localStorage if available
  const [likedSongs, setLikedSongs] = useState(() => {
  const saved = localStorage.getItem("likedSongs");
  console.log(saved)
  try {
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
});
  
  // Toggle state for the hamburger menu
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Filter toggle to show only liked songs
  const [showLikedOnly, setShowLikedOnly] = useState(false);
  
  // Theme state (light or dark mode)
  const [theme, setTheme] = useState("light");

  // Load theme from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark" || savedTheme === "light") {
      setTheme(savedTheme);
    }

    // Commented out: Alternative approach to loading liked songs
    // const savedLikedSongs = localStorage.getItem("likedSongs");
    // console.log(savedLikedSongs)
    // if (savedLikedSongs) {
    //   try {
    //     setLikedSongs(JSON.parse(savedLikedSongs));
    //   } catch (e) {
    //     console.error("Failed to parse liked songs from localStorage");
    //   }
    // }
  }, []);

  // Persist liked songs to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("likedSongs", JSON.stringify(likedSongs));
  }, [likedSongs]);

  // Toggle between light and dark themes
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  // Fetch songs from API based on the selected mood
  // Falls back to demo data if API fails
const loadSongs = useCallback(async (mood) => {
  if (!mood) return;
  setIsLoading(true);
  setError(null);
  setSongs([]);

  try {
    const res = await fetch(`https://zenify-1.onrender.com/api/songs/${mood}`);
    if (!res.ok) throw new Error("API error");
    const data = await res.json();

    // Handle different possible response formats
    const list = Array.isArray(data) ? data : data[mood] || data;

    // ✅ Shuffle + pick only 50 songs randomly
    const random50 = list
      .sort(() => Math.random() - 0.5) // shuffle
      .slice(0, 50); // pick first 50

    setSongs(random50.length ? random50 : []);
    
  } catch (err) {
    // Fallback if API fails
    setSongs([
      { title: "Sunny Days", artist: "The Vibes", year: "2023", duration: "3:45" },
      { title: "Feel Good", artist: "Happy Hearts", year: "2022", duration: "4:12" },
      { title: "Pure Joy", artist: "Mood Makers", year: "2024", duration: "3:28" },
      { title: "Bright Moments", artist: "Soul Collective", year: "2023", duration: "3:55" },
      { title: "Endless Summer", artist: "Beach Waves", year: "2023", duration: "4:01" },
    ]);
    setError("Using demo songs.");
  } finally {
    setIsLoading(false);
  }
}, []);


  // Load songs whenever the current mood changes
  useEffect(() => {
    if (currentMood) loadSongs(currentMood);
  }, [currentMood, loadSongs]);

  // Toggle like status for a song
  // Adds or removes the song from the likedSongs object
  const toggleLike = (songKey) => {
    setLikedSongs(prev => {
      const updated = { ...prev };
      if (updated[songKey]) {
        delete updated[songKey];
      } else {
        updated[songKey] = true;
      }
      return updated;
    });
  };

  // Generate a unique key for each song based on title and artist (not index)
  const getSongKey = (song) => `${song.title}-${song.artist}`;

  // Filter songs based on showLikedOnly toggle
  const displayedSongs = showLikedOnly 
    ? songs.filter((song) => likedSongs[getSongKey(song)])
    : songs;

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-gradient-to-br from-slate-900 via-purple-950 to-blue-950" : "bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50"} relative overflow-x-hidden`}>
      {/* Decorative background blur elements for visual effect */}
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-30">
        <div className={`absolute rounded-full ${theme === "dark" ? "bg-purple-700" : "bg-purple-300"} blur-3xl w-96 h-96 top-[10%] left-[5%]`} />
        <div className={`absolute rounded-full ${theme === "dark" ? "bg-blue-700" : "bg-blue-300"} blur-3xl w-[500px] h-[500px] top-[40%] right-[10%]`} />
        <div className={`absolute rounded-full ${theme === "dark" ? "bg-indigo-700" : "bg-indigo-300"} blur-3xl w-[450px] h-[450px] bottom-[10%] left-[30%]`} />
      </div>

      {/* Hamburger menu toggle button (fixed in top-right corner) */}
      <button
        className={`fixed top-6 right-6 z-50 w-12 h-12 ${theme === "dark" ? "bg-slate-800/90 border-purple-700" : "bg-white/90 border-purple-200"} backdrop-blur-md rounded-full shadow-lg flex items-center justify-center border-2 hover:scale-110 active:scale-95 transition-transform`}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {/* Show X icon when menu is open, Menu icon when closed */}
        {menuOpen ? <X className={theme === "dark" ? "text-purple-400" : "text-purple-700"} size={24} /> : <Menu className={theme === "dark" ? "text-purple-400" : "text-purple-700"} size={24} />}
      </button>

      {/* Semi-transparent overlay that appears when menu is open */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sliding side menu panel */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className={`fixed top-0 right-0 w-80 h-full ${theme === "dark" ? "bg-slate-900" : "bg-white"} shadow-2xl z-50 p-8`}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <h2 className={`text-2xl font-bold ${theme === "dark" ? "text-slate-100" : "text-slate-800"} mb-6`}>Menu</h2>
            
            {/* Theme toggle button (Light/Dark mode switcher) */}
            <button
              className={`w-full p-4 rounded-xl font-semibold text-left transition-all hover:scale-[1.02] active:scale-98 mb-4 ${
                theme === "dark" 
                  ? "bg-slate-800 text-slate-100 hover:bg-slate-700" 
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
              onClick={toggleTheme}
            >
              {/* Display appropriate icon and text based on current theme */}
              {theme === "dark" ? (
                <Sun className="inline mr-2" size={20} />
              ) : (
                <Moon className="inline mr-2" size={20} />
              )}
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </button>

            {/* Toggle button to filter liked songs */}
            <button
              className={`w-full p-4 rounded-xl font-semibold text-left transition-all hover:scale-[1.02] active:scale-98 ${
                showLikedOnly 
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white" 
                  : theme === "dark"
                  ? "bg-slate-800 text-slate-100 hover:bg-slate-700"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
              onClick={() => {
                setShowLikedOnly(!showLikedOnly);
                setMenuOpen(false);
              }}
            >
              {/* Heart icon that fills when liked songs filter is active */}
              <Heart className="inline mr-2" size={20} fill={showLikedOnly ? "white" : "none"} />
              {showLikedOnly ? "Show All Songs" : "Show Liked Songs"}
            </button>
            
            {/* Display count of liked songs */}
            <div className={`mt-6 text-sm ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
              <p className="font-semibold">Liked songs: {Object.keys(likedSongs).length}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content container */}
      <main className="max-w-[1200px] mx-auto px-8 py-12 min-h-screen">
        {/* Header section with title and tagline */}
        <motion.header
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1
            className="text-7xl font-black leading-tight mb-3 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
          >
            {config.site_title}
          </h1>
          <p className={`${theme === "dark" ? "text-slate-300" : "text-slate-600"} font-medium text-xl`}>
            {config.tagline}
          </p>
        </motion.header>

        {/* Grid of mood selection buttons */}
        <div className="grid gap-4 mb-16 grid-cols-[repeat(auto-fit,minmax(110px,1fr))]">
          {moods.map((m, i) => {
            const isActive = currentMood === m;
            return (
              <motion.button
                key={m}
                className={`rounded-2xl px-6 py-5 font-bold text-lg backdrop-blur-md border-2 transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white border-purple-400 shadow-xl scale-105"
                    : theme === "dark"
                    ? "bg-slate-800/70 text-slate-100 border-slate-700 hover:border-purple-500 hover:shadow-lg hover:-translate-y-1"
                    : "bg-white/70 text-slate-700 border-slate-200 hover:border-purple-300 hover:shadow-lg hover:-translate-y-1"
                }`}
                style={{ textTransform: "capitalize" }}
                onClick={() => setCurrentMood(m)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
              >
                {m}
              </motion.button>
            );
          })}
        </div>

        {/* Songs display container */}
        <motion.section
          className={`${theme === "dark" ? "bg-slate-800/80 border-slate-700/50" : "bg-white/80 border-white/50"} backdrop-blur-xl rounded-3xl p-10 shadow-2xl border-2 min-h-[400px]`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          {/* Section title that changes based on filter state */}
          <h2 className={`text-3xl font-bold ${theme === "dark" ? "text-slate-100" : "text-slate-800"} text-center mb-8`}>
            {showLikedOnly ? "💜 Your Liked Songs" : "🎵 Your Mood Playlist"}
          </h2>

          {/* Loading spinner displayed while fetching songs */}
          {isLoading && (
            <div className="text-center py-16">
              <div className={`mx-auto w-16 h-16 border-4 ${theme === "dark" ? "border-purple-800 border-t-purple-400" : "border-purple-200 border-t-purple-600"} rounded-full animate-spin mb-6`} />
              <p className={`${theme === "dark" ? "text-slate-300" : "text-slate-600"} font-semibold text-lg`}>
                Finding your perfect {currentMood} playlist...
              </p>
            </div>
          )}

          {/* Error message display (e.g., when using demo songs) */}
          {error && !isLoading && (
            <div className="text-center text-sm text-rose-600 mb-4 font-medium">{error}</div>
          )}

          {/* Empty state when no mood is selected and not in liked songs view */}
          {!currentMood && !isLoading && !showLikedOnly && (
            <div className={`text-center ${theme === "dark" ? "text-slate-400" : "text-slate-500"} text-lg py-16 font-medium`}>
              {config.no_mood_message}
            </div>
          )}

          {/* Songs list container */}
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {/* Empty state for liked songs filter when no songs are liked */}
              {!isLoading && showLikedOnly && displayedSongs.length === 0 && (
                <motion.div
                  className={`text-center ${theme === "dark" ? "text-slate-400" : "text-slate-500"} py-12 font-medium`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  No liked songs yet. Start exploring!
                </motion.div>
              )}

              {/* Empty state when mood is selected but no songs available */}
              {!isLoading && currentMood && !showLikedOnly && displayedSongs.length === 0 && (
                <motion.div
                  className={`text-center ${theme === "dark" ? "text-slate-400" : "text-slate-500"} py-12 font-medium`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  No songs found for this mood
                </motion.div>
              )}

              {/* Render each song as an animated card */}
              {!isLoading &&
                displayedSongs.map((song, idx) => {
                  const songKey = getSongKey(song);
                  const isLiked = likedSongs[songKey];
                  
                  return (
                    <motion.div
                      key={songKey}
                      className={`group flex justify-between items-center p-5 rounded-2xl ${
                        theme === "dark"
                          ? "bg-gradient-to-r from-slate-800 to-slate-700 border-slate-700 hover:border-purple-500"
                          : "bg-gradient-to-r from-white to-slate-50 border-slate-100 hover:border-purple-300"
                      } border-2 shadow-md hover:shadow-xl transition-all relative`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: idx * 0.05, duration: 0.3 }}
                      layout
                    >
                      {/* Song title and artist information */}
                      <div className="flex-1">
                        <div className={`${theme === "dark" ? "text-slate-100" : "text-slate-800"} font-bold text-lg`}>{song.title}</div>
                        <div className={`${theme === "dark" ? "text-slate-400" : "text-slate-600"} text-sm font-medium`}>{song.artist}</div>
                      </div>

                      {/* Right side container for metadata and like button */}
                      <div className="flex items-center gap-4">
                        {/* Song year and duration display */}
                        <div className={`text-right text-sm ${theme === "dark" ? "text-slate-400" : "text-slate-600"} mr-4`}>
                          <div className="font-semibold">{song.year ?? ""}</div>
                          <div className={`text-xs ${theme === "dark" ? "text-slate-500" : "text-slate-500"}`}>{song.duration ?? ""}</div>
                        </div>

                        {/* Heart/like button that appears on hover or when liked */}
                        <button
                          className={`p-3 rounded-full transition-all ${
                            isLiked 
                              ? "bg-gradient-to-r from-pink-500 to-rose-500 shadow-lg scale-100" 
                              : theme === "dark"
                              ? "bg-slate-700 opacity-0 group-hover:opacity-100 hover:scale-110"
                              : "bg-slate-100 opacity-0 group-hover:opacity-100 hover:scale-110"
                          }`}
                          onClick={() => toggleLike(songKey)}
                        >
                          {/* Heart icon that fills when song is liked */}
                          <Heart 
                            size={20} 
                            fill={isLiked ? "white" : "none"}
                            className={isLiked ? "text-white" : theme === "dark" ? "text-slate-300" : "text-slate-600"}
                          />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
            </AnimatePresence>
          </div>
        </motion.section>
      </main>
    </div>
  );
}