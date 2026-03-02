import { Link, useNavigate } from 'react-router-dom';
import { Camera, Compass, User as UserIcon, LogOut, Star, Sun, Moon, ChevronDown, Menu, X } from 'lucide-react';
import { useContext, useState, useRef, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { theme, toggleTheme } = useContext(ThemeContext);
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = () => {
        logout();
        setDropdownOpen(false);
        navigate('/login');
    };

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <nav className="bg-[var(--bg-primary)]/80 backdrop-blur-2xl sticky top-0 z-50 border-b border-[var(--border-color)] shadow-sm">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="flex items-center gap-2">
                        <Compass className="w-8 h-8 text-brand-500" />
                        <span className="font-bold text-xl tracking-tight text-[var(--text-primary)]">Linktrip</span>
                    </Link>

                    <div className="flex items-center gap-4">
                        {user ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center gap-2 hover:bg-[var(--bg-tertiary)]/50 p-1.5 rounded-full transition-colors"
                                >
                                    <div className="w-9 h-9 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] overflow-hidden flex items-center justify-center shrink-0">
                                        {user.profilePic ? (
                                            <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-sm">👤</span>
                                        )}
                                    </div>
                                    <ChevronDown className={`w-4 h-4 text-[var(--text-secondary)] transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Dropdown Menu */}
                                {dropdownOpen && (
                                    <div className="absolute right-0 mt-3 w-56 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 origin-top-right">

                                        {/* User Info Header */}
                                        <div className="px-4 py-3 border-b border-[var(--border-color)] mb-2">
                                            <p className="font-bold text-[var(--text-primary)] truncate">{user.name}</p>
                                            {user.points !== undefined && (
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="bg-brand-500/10 text-brand-600 dark:text-brand-400 px-2 py-0.5 rounded-md text-[10px] font-bold border border-brand-500/20 flex items-center gap-1">
                                                        <Star className="w-3 h-3" /> Lvl {Math.floor(user.points / 50) + 1}
                                                    </span>
                                                    <span className="text-xs font-semibold text-[var(--text-secondary)]">{user.points} XP</span>
                                                </div>
                                            )}
                                        </div>

                                        <Link
                                            to="/create-post"
                                            onClick={() => setDropdownOpen(false)}
                                            className="w-full text-left px-4 py-2.5 flex items-center gap-3 text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                                        >
                                            <Camera className="w-5 h-5 text-brand-500" />
                                            <span className="font-medium">Create Post</span>
                                        </Link>

                                        <Link
                                            to={`/profile/${user.id || user._id}`}
                                            onClick={() => setDropdownOpen(false)}
                                            className="w-full text-left px-4 py-2.5 flex items-center gap-3 text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                                        >
                                            <UserIcon className="w-5 h-5 text-[var(--text-secondary)]" />
                                            <span className="font-medium">Your Profile</span>
                                        </Link>

                                        <button
                                            onClick={toggleTheme}
                                            className="w-full text-left px-4 py-2.5 flex items-center gap-3 text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                                        >
                                            {theme === 'dark' ? (
                                                <Sun className="w-5 h-5 text-yellow-500" />
                                            ) : (
                                                <Moon className="w-5 h-5 text-indigo-500" />
                                            )}
                                            <span className="font-medium">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                                        </button>

                                        <div className="h-px bg-[var(--border-color)] my-2"></div>

                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2.5 flex items-center gap-3 text-red-500 hover:bg-red-500/10 transition-colors"
                                        >
                                            <LogOut className="w-5 h-5" />
                                            <span className="font-medium">Logout</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link to="/login" className="px-5 py-2 bg-brand-600 text-white rounded-full text-sm font-medium hover:bg-brand-500 transition-colors shadow-lg shadow-brand-500/20">
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
