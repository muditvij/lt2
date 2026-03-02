import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { MapPin, MessageSquare, Heart, Send, Compass, Trash2, Globe, Users, Zap } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';

const TRAVEL_QUOTES = [
    "To travel is to live.",
    "Adventure is out there.",
    "Life is short and the world is wide.",
    "Not all those who wander are lost.",
    "Collect moments, not things.",
    "Travel far enough, you meet yourself."
];

const Home = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);
    const [activeCommentPost, setActiveCommentPost] = useState(null);
    const [commentText, setCommentText] = useState('');
    const [feedType, setFeedType] = useState('all');
    const [quoteIndex, setQuoteIndex] = useState(0);

    // Rotating quotes for Landing Page
    useEffect(() => {
        if (!user) {
            const interval = setInterval(() => {
                setQuoteIndex((prev) => (prev + 1) % TRAVEL_QUOTES.length);
            }, 4000);
            return () => clearInterval(interval);
        }
    }, [user]);

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                const endpoint = feedType === 'following' && user ? '/posts/feed' : '/posts';
                const res = await axios.get(endpoint);
                setPosts(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, [feedType, user]);

    const handleLike = async (postId) => {
        if (!user) return alert('Please login to like posts');
        try {
            const res = await axios.put(`/posts/like/${postId}`);
            setPosts(posts.map(post =>
                post._id === postId ? { ...post, likes: res.data } : post
            ));
        } catch (err) {
            console.error(err.response?.data?.msg || 'Error liking post');
        }
    };

    const handleCommentSubmit = async (e, postId) => {
        e.preventDefault();
        if (!user) return alert('Please login to comment');
        if (!commentText.trim()) return;

        try {
            const res = await axios.post(`/posts/comment/${postId}`, { text: commentText });
            setPosts(posts.map(post =>
                post._id === postId ? { ...post, comments: res.data } : post
            ));
            setCommentText('');
            setActiveCommentPost(null);
        } catch (err) {
            console.error('Error adding comment');
        }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm("Are you sure you want to delete this post?")) return;
        try {
            await axios.delete(`/posts/${postId}`);
            setPosts(posts.filter(post => post._id !== postId));
        } catch (err) {
            console.error('Error deleting post:', err);
            alert('Failed to delete post.');
        }
    };

    // ==================
    // LANDING PAGE (Not Logged In)
    // ==================
    if (!user) {
        // Animation Variants
        const containerVariants = {
            hidden: { opacity: 0 },
            visible: {
                opacity: 1,
                transition: {
                    staggerChildren: 0.2,
                    delayChildren: 0.1
                }
            }
        };

        const itemVariants = {
            hidden: { y: 20, opacity: 0 },
            visible: {
                y: 0,
                opacity: 1,
                transition: { type: "spring", stiffness: 100 }
            }
        };

        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center relative px-4 overflow-hidden -mt-16 pt-16">
                {/* Vibrant Background Orbs for Landing Page */}
                <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-fuchsia-600/30 rounded-full blur-[150px] pointer-events-none animate-blob z-0"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-amber-500/20 rounded-full blur-[150px] pointer-events-none animate-blob animation-delay-4000 z-0"></div>
                <div className="absolute top-[30%] left-[30%] w-[40vw] h-[40vw] bg-emerald-500/20 rounded-full blur-[120px] pointer-events-none animate-blob animation-delay-2000 z-0"></div>

                <motion.div
                    className="relative z-10 max-w-5xl mx-auto flex flex-col items-center w-full"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div variants={itemVariants} className="w-24 h-24 bg-[var(--bg-secondary)]/80 backdrop-blur-3xl rounded-3xl flex items-center justify-center mb-8 border border-[var(--border-color)] shadow-2xl">
                        <Compass className="w-12 h-12 text-brand-500 animate-pulse" />
                    </motion.div>

                    <motion.h1 variants={itemVariants} className="text-6xl md:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-[var(--text-primary)] to-[var(--text-tertiary)] mb-6 tracking-tighter drop-shadow-2xl leading-tight">
                        Discover The World
                    </motion.h1>

                    <motion.div variants={itemVariants} className="h-16 mb-10 flex items-center justify-center">
                        <motion.p
                            key={quoteIndex}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.5 }}
                            className="text-xl md:text-3xl text-[var(--text-secondary)] font-light italic"
                        >
                            "{TRAVEL_QUOTES[quoteIndex]}"
                        </motion.p>
                    </motion.div>

                    <motion.p variants={itemVariants} className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-12 font-medium leading-relaxed bg-[var(--bg-primary)]/40 p-6 rounded-3xl backdrop-blur-sm border border-[var(--border-color)] shadow-xl">
                        Join millions of explorers sharing their hidden gems. Capture your journey, connect with locals, and inspire others to wander.
                    </motion.p>

                    <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-12">
                        {/* Feature Cards */}
                        <div className="glass-card p-6 rounded-3xl hover-glow group border-[var(--border-color)] bg-[var(--bg-secondary)]">
                            <div className="w-12 h-12 rounded-full bg-brand-500/10 flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                                <Globe className="w-6 h-6 text-brand-500" />
                            </div>
                            <h3 className="font-bold text-[var(--text-primary)] mb-2">Explore Anywhere</h3>
                            <p className="text-sm text-[var(--text-secondary)]">Find hidden spots curated by real travelers.</p>
                        </div>
                        <div className="glass-card p-6 rounded-3xl hover-glow group border-[var(--border-color)] bg-[var(--bg-secondary)]">
                            <div className="w-12 h-12 rounded-full bg-fuchsia-500/10 flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                                <Users className="w-6 h-6 text-fuchsia-500" />
                            </div>
                            <h3 className="font-bold text-[var(--text-primary)] mb-2">Connect globally</h3>
                            <p className="text-sm text-[var(--text-secondary)]">Share your stories and build a following.</p>
                        </div>
                        <div className="glass-card p-6 rounded-3xl hover-glow group border-[var(--border-color)] bg-[var(--bg-secondary)]">
                            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                                <Zap className="w-6 h-6 text-amber-500" />
                            </div>
                            <h3 className="font-bold text-[var(--text-primary)] mb-2">Earn XP & Badges</h3>
                            <p className="text-sm text-[var(--text-secondary)]">Level up as you contribute to the community.</p>
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto">
                        <Link to="/register" className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-brand-500 to-emerald-500 text-white rounded-full text-lg font-bold hover:scale-105 transition-all shadow-2xl shadow-brand-500/30">
                            Start Exploring Free
                        </Link>
                        <Link to="/login" className="w-full sm:w-auto px-10 py-4 bg-[var(--bg-secondary)] backdrop-blur-md text-[var(--text-primary)] border border-[var(--border-color)] rounded-full text-lg font-bold hover:bg-[var(--bg-tertiary)] transition-colors shadow-lg">
                            I already have an account
                        </Link>
                    </motion.div>
                </motion.div>
            </div>
        );
    }

    // ==================
    // INSTAGRAM FEED (Logged In)
    // ==================
    return (
        <div className="max-w-xl mx-auto pb-20">
            {/* Feed Toggle Header */}
            <div className="sticky top-[4.5rem] bg-[var(--bg-primary)]/90 backdrop-blur-xl z-40 py-4 mb-6 border-b border-[var(--border-color)] flex justify-center gap-2">
                <button
                    onClick={() => setFeedType('all')}
                    className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${feedType === 'all' ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-lg' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'}`}
                >
                    For You
                </button>
                <button
                    onClick={() => setFeedType('following')}
                    className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${feedType === 'following' ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-lg' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'}`}
                >
                    Following
                </button>
            </div>

            {/* Posts Stream */}
            <div className="space-y-8">
                {loading ? (
                    <div className="text-center text-[var(--text-secondary)] py-12 animate-pulse font-medium">Loading the latest adventures...</div>
                ) : posts.length === 0 ? (
                    <div className="glass-card rounded-3xl p-12 text-center relative overflow-hidden group">
                        <h2 className="text-2xl font-bold mb-4 text-[var(--text-primary)]">No stories yet</h2>
                        <p className="text-[var(--text-secondary)] mb-6">Time to embark on an adventure.</p>
                        <Link to="/create-post" className="inline-block px-8 py-3 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-full font-bold hover:opacity-90 transition-opacity">
                            Share a Post
                        </Link>
                    </div>
                ) : (
                    posts.map(post => {
                        const isOwner = (user.id || user._id) === post.user?._id;

                        return (
                            <div key={post._id} className="bg-[var(--bg-secondary)] border border-[var(--border-color)] sm:rounded-[2rem] overflow-hidden shadow-sm">

                                {/* Post Header */}
                                <div className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Link to={`/profile/${post.user?._id}`} className="w-10 h-10 bg-[var(--bg-tertiary)] rounded-full border border-[var(--border-color)] overflow-hidden shrink-0">
                                            {post.user?.profilePic ? <img src={post.user.profilePic} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center">👤</div>}
                                        </Link>
                                        <div className="flex flex-col">
                                            <Link to={`/profile/${post.user?._id}`} className="font-bold text-sm text-[var(--text-primary)] hover:underline">
                                                {post.user?.name || 'Explorer'}
                                            </Link>
                                            {post.location && (
                                                <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
                                                    <MapPin className="w-3 h-3 text-brand-500" /> {post.location}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {isOwner && (
                                        <button
                                            onClick={() => handleDeletePost(post._id)}
                                            className="text-[var(--text-tertiary)] hover:text-red-500 p-2 transition-colors"
                                            title="Delete Post"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>

                                {/* Post Image (Instagram Style: Full Width Square/Portrait) */}
                                <div className="w-full bg-[var(--bg-tertiary)] max-h-[800px] flex items-center justify-center overflow-hidden">
                                    {post.image ? (
                                        <img src={post.image} alt="Post" className="w-full h-auto max-h-[800px] object-cover" />
                                    ) : (
                                        <div className="w-full aspect-square flex flex-col items-center justify-center bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-secondary)] border-y border-[var(--border-color)]">
                                            <span className="text-6xl mb-4 opacity-80">🌍</span>
                                            <span className="text-[var(--text-tertiary)] text-sm font-bold tracking-widest uppercase bg-[var(--bg-primary)]/80 px-4 py-1.5 rounded-full border border-[var(--border-color)]">Travel Log</span>
                                        </div>
                                    )}
                                </div>

                                {/* Post Actions & Caption */}
                                <div className="p-4">
                                    <div className="flex items-center gap-4 mb-3">
                                        <button
                                            onClick={() => handleLike(post._id)}
                                            className={`transition-transform hover:scale-110 active:scale-95 ${post.likes?.includes(user?.id || user?._id) ? 'text-red-500' : 'text-[var(--text-primary)]'}`}
                                        >
                                            <Heart className={`w-7 h-7 ${post.likes?.includes(user?.id || user?._id) ? 'fill-current text-red-500' : ''}`} />
                                        </button>
                                        <button
                                            onClick={() => setActiveCommentPost(activeCommentPost === post._id ? null : post._id)}
                                            className="transition-transform hover:scale-110 active:scale-95 text-[var(--text-primary)]"
                                        >
                                            <MessageSquare className="w-7 h-7" />
                                        </button>
                                    </div>

                                    <div className="font-bold text-sm text-[var(--text-primary)] mb-2">
                                        {post.likes?.length || 0} likes
                                    </div>

                                    <p className="text-sm text-[var(--text-primary)] leading-snug">
                                        <span className="font-bold mr-2">{post.user?.name || 'Explorer'}</span>
                                        {post.caption}
                                    </p>

                                    {post.comments?.length > 0 && (
                                        <button
                                            className="text-[var(--text-secondary)] text-sm mt-2 hover:underline"
                                            onClick={() => setActiveCommentPost(activeCommentPost === post._id ? null : post._id)}
                                        >
                                            View all {post.comments.length} comments
                                        </button>
                                    )}

                                    {/* Comments Dropdown */}
                                    {activeCommentPost === post._id && (
                                        <div className="mt-4 pt-3 border-t border-[var(--border-color)]">
                                            <div className="max-h-48 overflow-y-auto custom-scrollbar mb-3 space-y-2">
                                                {post.comments?.map((comment, i) => (
                                                    <div key={i} className="text-sm flex gap-2">
                                                        <span className="font-bold text-[var(--text-primary)]">User</span>
                                                        <span className="text-[var(--text-secondary)]">{comment.text}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <form onSubmit={(e) => handleCommentSubmit(e, post._id)} className="flex items-center gap-2 mt-2">
                                                <input
                                                    type="text"
                                                    value={commentText}
                                                    onChange={(e) => setCommentText(e.target.value)}
                                                    placeholder="Add a comment..."
                                                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none"
                                                />
                                                <button type="submit" disabled={!commentText.trim()} className="text-brand-500 font-bold text-sm disabled:opacity-50">
                                                    Post
                                                </button>
                                            </form>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    );
};

export default Home;
