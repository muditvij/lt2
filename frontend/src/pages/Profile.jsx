import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Users, Image as ImageIcon, Edit3, X, Camera, Award, Star, Heart, MessageSquare, Trash2, Send } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
    const { userId } = useParams();
    const { user: currentUser, setUser } = useContext(AuthContext);

    // Use param ID or fallback to logged in user ID
    const displayUserId = userId || currentUser?.id || currentUser?._id;
    const isOwnProfile = currentUser && (displayUserId === currentUser.id || displayUserId === currentUser._id);

    const [profileData, setProfileData] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isEditing, setIsEditing] = useState(false);
    const [followModal, setFollowModal] = useState(null); // 'followers' or 'following'
    const [selectedPost, setSelectedPost] = useState(null); // For post popup

    // Form and Interactive State
    const [formData, setFormData] = useState({ name: '', bio: '', location: '' });
    const [profilePicFile, setProfilePicFile] = useState(null);
    const [coverPicFile, setCoverPicFile] = useState(null);
    const [saving, setSaving] = useState(false);
    const [editError, setEditError] = useState('');
    const [commentText, setCommentText] = useState('');

    useEffect(() => {
        const fetchProfileData = async () => {
            if (!displayUserId) return;
            try {
                const [userRes, postsRes] = await Promise.all([
                    axios.get(`/users/${displayUserId}`),
                    axios.get(`/posts/user/${displayUserId}`)
                ]);
                setProfileData(userRes.data);
                setPosts(postsRes.data);
                setFormData({
                    name: userRes.data.name || '',
                    bio: userRes.data.bio || '',
                    location: userRes.data.location || '',
                });
            } catch (err) {
                console.error('Error fetching profile:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfileData();
    }, [displayUserId]);

    const handleFollowToggle = async () => {
        if (!currentUser) return;
        const currentUserId = currentUser.id || currentUser._id;
        const isFollowing = profileData.followers?.some(f => (f._id || f) === currentUserId);

        try {
            if (isFollowing) {
                await axios.put(`/users/unfollow/${displayUserId}`);
                setProfileData(prev => ({
                    ...prev,
                    followers: prev.followers.filter(f => (f._id || f) !== currentUserId)
                }));
            } else {
                await axios.put(`/users/follow/${displayUserId}`);
                setProfileData(prev => ({
                    ...prev,
                    followers: [...(prev.followers || []), {
                        _id: currentUserId,
                        name: currentUser.name,
                        profilePic: currentUser.profilePic
                    }]
                }));
            }
        } catch (err) {
            console.error('Error toggling follow:', err);
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        setEditError('');
        try {
            const submitData = new FormData();
            submitData.append('name', formData.name);
            submitData.append('bio', formData.bio);
            submitData.append('location', formData.location);
            if (profilePicFile) submitData.append('profilePic', profilePicFile);
            if (coverPicFile) submitData.append('coverPic', coverPicFile);

            const res = await axios.put('/users/edit', submitData);
            setProfileData(res.data);
            setIsEditing(false);
            setProfilePicFile(null);
            setCoverPicFile(null);

            if (currentUser && setUser && isOwnProfile) {
                setUser(prev => ({ ...prev, ...res.data }));
            }
        } catch (err) {
            console.error('Failed to update profile:', err);
            setEditError(err.response?.data?.msg || 'Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    // Post Interactions inside the Modal
    const handleLike = async (postId) => {
        if (!currentUser) return alert('Please login to like posts');
        try {
            const res = await axios.put(`/posts/like/${postId}`);
            const updatedLikes = res.data;

            // Update selected post state
            setSelectedPost(prev => ({ ...prev, likes: updatedLikes }));

            // Update posts grid state
            setPosts(posts.map(post =>
                post._id === postId ? { ...post, likes: updatedLikes } : post
            ));
        } catch (err) {
            console.error(err.response?.data?.msg || 'Error liking post');
        }
    };

    const handleCommentSubmit = async (e, postId) => {
        e.preventDefault();
        if (!currentUser) return alert('Please login to comment');
        if (!commentText.trim()) return;

        try {
            const res = await axios.post(`/posts/comment/${postId}`, { text: commentText });
            const updatedComments = res.data;

            // Update selected post state
            setSelectedPost(prev => ({ ...prev, comments: updatedComments }));

            // Update posts grid state
            setPosts(posts.map(post =>
                post._id === postId ? { ...post, comments: updatedComments } : post
            ));

            setCommentText('');
        } catch (err) {
            console.error('Error adding comment');
        }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm("Are you sure you want to delete this post?")) return;
        try {
            await axios.delete(`/posts/${postId}`);
            setPosts(posts.filter(post => post._id !== postId));
            setSelectedPost(null); // Close modal
        } catch (err) {
            console.error('Error deleting post:', err);
            alert('Failed to delete post.');
        }
    };

    if (loading) return <div className="text-center text-brand-500 py-20 animate-pulse font-medium">Loading explorer profile...</div>;
    if (!profileData) return <div className="text-center text-red-400 py-20">Profile not found.</div>;

    return (
        <div className="max-w-4xl mx-auto pb-12">
            {/* Profile Header */}
            <div className="bg-[var(--bg-secondary)] rounded-3xl overflow-hidden shadow-sm border border-[var(--border-color)] mb-12">
                <div className="h-64 bg-[var(--bg-tertiary)] relative overflow-hidden group">
                    {/* Cover Photo */}
                    {profileData.coverPic ? (
                        <img src={profileData.coverPic} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-900/40 via-[var(--bg-secondary)] to-[var(--bg-primary)]"></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-secondary)] to-transparent"></div>
                </div>

                <div className="px-8 pb-8 relative -mt-20">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-end mb-6 gap-4">
                        <div className="w-36 h-36 bg-[var(--bg-primary)] rounded-full border-4 border-[var(--bg-secondary)] shadow-2xl flex items-center justify-center text-5xl text-[var(--text-tertiary)] overflow-hidden shrink-0 relative z-10 group">
                            {profileData.profilePic ? (
                                <img src={profileData.profilePic} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <span>🏕️</span>
                            )}
                        </div>

                        {isOwnProfile ? (
                            <button
                                onClick={() => {
                                    setIsEditing(true);
                                    setEditError('');
                                }}
                                className="px-6 py-2.5 bg-[var(--bg-tertiary)]/80 backdrop-blur border border-[var(--border-color)] text-[var(--text-primary)] rounded-full font-medium hover:bg-[var(--bg-tertiary)] transition-colors flex items-center gap-2 shadow-lg w-fit z-10 relative"
                            >
                                <Edit3 className="w-4 h-4" /> Edit Profile
                            </button>
                        ) : currentUser && (
                            <button
                                onClick={handleFollowToggle}
                                className={`px-6 py-2.5 rounded-full font-semibold transition-colors flex items-center gap-2 shadow-lg w-fit z-10 relative ${profileData.followers?.some(f => (f._id || f) === (currentUser.id || currentUser._id))
                                    ? 'bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] hover:opacity-80'
                                    : 'bg-brand-600 text-white hover:bg-brand-500 shadow-brand-500/20'
                                    }`}
                            >
                                {profileData.followers?.some(f => (f._id || f) === (currentUser.id || currentUser._id)) ? 'Following' : 'Follow'}
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-4xl font-extrabold text-[var(--text-primary)] tracking-tight">{profileData.name}</h1>
                        <span className="bg-brand-500/10 text-brand-600 dark:text-brand-400 px-3 py-1 rounded-full text-sm font-bold border border-brand-500/20 shadow-sm flex items-center gap-1.5">
                            <Star className="w-3.5 h-3.5" /> Lvl {Math.floor((profileData.points || 0) / 50) + 1}
                        </span>
                    </div>

                    {profileData.location && (
                        <p className="text-brand-500 flex items-center gap-1.5 mb-4 font-medium">
                            <MapPin className="w-4 h-4" /> {profileData.location}
                        </p>
                    )}

                    {profileData.bio ? (
                        <p className="text-[var(--text-secondary)] mb-8 max-w-2xl leading-relaxed text-lg">
                            {profileData.bio}
                        </p>
                    ) : (
                        <p className="text-[var(--text-tertiary)] mb-8 max-w-2xl italic">No bio provided yet. A mysterious traveler...</p>
                    )}

                    {/* Badges Section */}
                    {profileData.badges && profileData.badges.length > 0 && (
                        <div className="mb-8 flex flex-wrap gap-3">
                            {profileData.badges.map((badge, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 bg-gradient-to-r from-brand-500/10 to-emerald-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-400 px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm">
                                    <Award className="w-4 h-4 text-brand-500" /> {badge}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex gap-8 border-t border-[var(--border-color)] pt-6 flex-wrap">
                        <div className="flex flex-col">
                            <span className="font-extrabold text-2xl text-[var(--text-primary)]">{profileData.points || 0}</span>
                            <span className="text-[var(--text-tertiary)] text-sm flex items-center gap-1.5 uppercase tracking-wider font-semibold">
                                <Star className="w-4 h-4 text-yellow-500" /> Points
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-extrabold text-2xl text-[var(--text-primary)]">{posts.length}</span>
                            <span className="text-[var(--text-tertiary)] text-sm flex items-center gap-1.5 uppercase tracking-wider font-semibold"><ImageIcon className="w-4 h-4" /> Journeys</span>
                        </div>
                        <button onClick={() => setFollowModal('followers')} className="flex flex-col text-left hover:opacity-80 transition-opacity">
                            <span className="font-extrabold text-2xl text-[var(--text-primary)]">{profileData.followers?.length || 0}</span>
                            <span className="text-brand-500 text-sm flex items-center gap-1.5 uppercase tracking-wider font-semibold hover:underline"><Users className="w-4 h-4" /> Followers</span>
                        </button>
                        <button onClick={() => setFollowModal('following')} className="flex flex-col text-left hover:opacity-80 transition-opacity">
                            <span className="font-extrabold text-2xl text-[var(--text-primary)]">{profileData.following?.length || 0}</span>
                            <span className="text-brand-500 text-sm flex items-center gap-1.5 uppercase tracking-wider font-semibold hover:underline"><Users className="w-4 h-4" /> Following</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Posts Grid */}
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6 px-2 flex items-center gap-2">
                <Camera className="w-6 h-6 text-brand-500" /> Travel Log
            </h2>

            {posts.length === 0 ? (
                <div className="text-center py-12 bg-[var(--bg-secondary)] rounded-3xl border border-[var(--border-color)]">
                    <p className="text-[var(--text-secondary)] text-lg">No journeys recorded yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {posts.map((post) => (
                        <div
                            key={post._id}
                            onClick={() => setSelectedPost(post)}
                            className="aspect-square bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl relative overflow-hidden group shadow-sm cursor-pointer"
                        >
                            {post.image ? (
                                <img src={post.image} alt="Post" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--text-tertiary)] bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-secondary)] p-4 text-center">
                                    <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                                    <p className="text-xs text-[var(--text-secondary)] line-clamp-3">{post.caption}</p>
                                </div>
                            )}

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-3 text-white font-medium p-4 text-center z-10">
                                <p className="text-sm line-clamp-2 mb-2">"{post.caption}"</p>
                                <div className="flex gap-4">
                                    <span className="flex items-center gap-1.5 font-bold"><Heart className="w-5 h-5 fill-current" /> {post.likes?.length || 0}</span>
                                    <span className="flex items-center gap-1.5 font-bold"><MessageSquare className="w-5 h-5 fill-current" /> {post.comments?.length || 0}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Post Details Modal */}
            {selectedPost && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200" onClick={() => setSelectedPost(null)}>
                    <div
                        className="bg-[var(--bg-primary)] rounded-[2rem] w-full max-w-5xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden shadow-2xl relative border border-[var(--border-color)]"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setSelectedPost(null)}
                            className="absolute top-4 right-4 text-[var(--bg-primary)] hover:opacity-80 transition-colors bg-[var(--text-primary)] p-2 rounded-full z-50 shadow-lg md:text-[var(--text-secondary)] md:bg-[var(--bg-tertiary)] md:hover:text-[var(--text-primary)]"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Left Side: Image */}
                        <div className="md:w-3/5 bg-[var(--bg-tertiary)] flex items-center justify-center max-h-[50vh] md:max-h-[90vh] overflow-hidden">
                            {selectedPost.image ? (
                                <img src={selectedPost.image} alt="Post" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-6xl text-[var(--text-tertiary)] text-center p-12">🌍<br /><span className="text-lg font-bold uppercase tracking-widest mt-4 block">Travel Log</span></div>
                            )}
                        </div>

                        {/* Right Side: Details */}
                        <div className="md:w-2/5 flex flex-col h-full max-h-[50vh] md:max-h-[90vh] bg-[var(--bg-secondary)]">
                            {/* Header */}
                            <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between items-start shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-[var(--bg-tertiary)] rounded-full overflow-hidden shrink-0 border border-[var(--border-color)]">
                                        {profileData.profilePic ? <img src={profileData.profilePic} alt="Profile" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center">👤</div>}
                                    </div>
                                    <div>
                                        <div className="font-bold text-[var(--text-primary)]">{profileData.name}</div>
                                        {selectedPost.location && <div className="text-xs text-[var(--text-secondary)] flex items-center gap-1"><MapPin className="w-3 h-3 text-brand-500" /> {selectedPost.location}</div>}
                                    </div>
                                </div>
                                {isOwnProfile && (
                                    <button
                                        onClick={() => handleDeletePost(selectedPost._id)}
                                        className="text-[var(--text-tertiary)] hover:text-red-500 mr-8 transition-colors"
                                        title="Delete Post"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                )}
                            </div>

                            {/* Scrollable Content: Caption & Comments */}
                            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 hidden sm:block">
                                        {profileData.profilePic ? <img src={profileData.profilePic} alt="Profile" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-[var(--bg-tertiary)] flex items-center justify-center text-xs">👤</div>}
                                    </div>
                                    <p className="text-sm text-[var(--text-primary)]"><span className="font-bold mr-2">{profileData.name}</span>{selectedPost.caption}</p>
                                </div>

                                <div className="h-px w-full bg-[var(--border-color)] my-4"></div>

                                {selectedPost.comments?.length > 0 ? (
                                    <div className="space-y-3">
                                        {selectedPost.comments.map((comment, i) => (
                                            <div key={i} className="text-sm flex gap-3">
                                                <div className="w-8 h-8 bg-[var(--bg-tertiary)] rounded-full flex items-center justify-center shrink-0">👤</div>
                                                <div>
                                                    <span className="font-bold text-[var(--text-primary)] block mr-2">User</span>
                                                    <span className="text-[var(--text-secondary)]">{comment.text}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-[var(--text-tertiary)] text-sm text-center italic mt-10">No comments yet.</p>
                                )}
                            </div>

                            {/* Actions & Comment Input */}
                            <div className="p-4 border-t border-[var(--border-color)] shrink-0 bg-[var(--bg-secondary)]">
                                <div className="flex items-center gap-4 mb-3">
                                    <button onClick={() => handleLike(selectedPost._id)} className={`transition-transform hover:scale-110 active:scale-95 ${selectedPost.likes?.includes(currentUser?.id || currentUser?._id) ? 'text-red-500' : 'text-[var(--text-primary)]'}`}>
                                        <Heart className={`w-7 h-7 ${selectedPost.likes?.includes(currentUser?.id || currentUser?._id) ? 'fill-current text-red-500' : ''}`} />
                                    </button>
                                </div>
                                <div className="font-bold text-sm text-[var(--text-primary)] mb-4">{selectedPost.likes?.length || 0} likes</div>

                                {currentUser && (
                                    <form onSubmit={(e) => handleCommentSubmit(e, selectedPost._id)} className="flex items-center gap-2">
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
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Profile Modal */}
            {isEditing && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[var(--bg-secondary)] rounded-3xl border border-[var(--border-color)] w-full max-w-lg overflow-hidden shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors bg-[var(--bg-tertiary)] p-2 rounded-full z-10"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="p-8">
                            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Edit Profile</h2>

                            {editError && (
                                <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-xl mb-6 text-sm font-medium">
                                    {editError}
                                </div>
                            )}

                            <form className="space-y-5" onSubmit={handleSaveProfile}>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Profile Picture</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={e => setProfilePicFile(e.target.files[0])}
                                        className="w-full px-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)] rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all
                                        file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-600 file:text-white hover:file:bg-brand-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Cover Picture</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={e => setCoverPicFile(e.target.files[0])}
                                        className="w-full px-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)] rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all
                                        file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--bg-tertiary)] file:text-[var(--text-primary)] hover:file:opacity-80"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder:text-[var(--text-tertiary)]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Location</label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder:text-[var(--text-tertiary)]"
                                        placeholder="e.g. Tokyo, Japan"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Bio</label>
                                    <textarea
                                        rows="3"
                                        value={formData.bio}
                                        onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all resize-none placeholder:text-[var(--text-tertiary)]"
                                        placeholder="Share your travel philosophy..."
                                    ></textarea>
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="px-8 py-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-500 transition-colors shadow-lg shadow-brand-500/20 disabled:opacity-50"
                                    >
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Follow Modal */}
            {followModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[var(--bg-secondary)] rounded-3xl border border-[var(--border-color)] w-full max-w-sm overflow-hidden shadow-2xl relative">
                        <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)]">
                            <h2 className="text-xl font-bold text-[var(--text-primary)] capitalize">{followModal}</h2>
                            <button
                                onClick={() => setFollowModal(null)}
                                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-1"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-2 max-h-96 overflow-y-auto custom-scrollbar">
                            {profileData[followModal]?.length === 0 ? (
                                <p className="text-center text-[var(--text-tertiary)] py-8 italic">No {followModal} to display.</p>
                            ) : (
                                profileData[followModal]?.map((person, i) => (
                                    <a
                                        key={person._id || i}
                                        href={`/profile/${person._id}`}
                                        className="flex items-center gap-4 p-4 hover:bg-[var(--bg-tertiary)] rounded-2xl transition-colors group"
                                    >
                                        <div className="w-12 h-12 bg-[var(--bg-primary)] rounded-full flex items-center justify-center overflow-hidden shrink-0 border border-[var(--border-color)]">
                                            {person.profilePic ? (
                                                <img src={person.profilePic} alt={person.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-lg">👤</span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-[var(--text-primary)] group-hover:text-brand-500 transition-colors">{person.name}</p>
                                        </div>
                                    </a>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
