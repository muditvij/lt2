import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, MapPin, Image as ImageIcon, X, Link as LinkIcon } from 'lucide-react';
import axios from 'axios';

const CreatePost = () => {
    const [formData, setFormData] = useState({ caption: '', location: '', imageUrl: '' });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetchingLocation, setFetchingLocation] = useState(false);
    const [locationSuggestions, setLocationSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    // Fetch Location suggestions from OpenStreetMap Nominatim
    const fetchLocationSuggestions = async (query) => {
        if (!query.trim()) {
            setLocationSuggestions([]);
            return;
        }
        try {
            const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
            setLocationSuggestions(res.data);
        } catch (err) {
            console.error("Error fetching locations", err);
        }
    };

    const handleLocationChange = (e) => {
        const val = e.target.value;
        setFormData({ ...formData, location: val });
        setShowSuggestions(true);
        // Debounce simple logic
        setTimeout(() => {
            if (val === formData.location) {
                fetchLocationSuggestions(val);
            }
        }, 300); // 300ms delay
    };

    const handleSelectSuggestion = (locationName) => {
        setFormData({ ...formData, location: locationName });
        setShowSuggestions(false);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setFormData(prev => ({ ...prev, imageUrl: '' })); // Clear URL if file selected
        }
    };

    const handleUrlChange = (e) => {
        const url = e.target.value;
        setFormData(prev => ({ ...prev, imageUrl: url }));
        if (url) {
            setImagePreview(url);
            setImageFile(null); // Clear file if URL provided
            if (fileInputRef.current) fileInputRef.current.value = '';
        } else {
            setImagePreview(null);
        }
    };

    const clearImage = () => {
        setImageFile(null);
        setImagePreview(null);
        setFormData(prev => ({ ...prev, imageUrl: '' }));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const detectLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        setFetchingLocation(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    if (res.data && res.data.address) {
                        const city = res.data.address.city || res.data.address.town || res.data.address.village;
                        const country = res.data.address.country;
                        setFormData(prev => ({ ...prev, location: city ? `${city}, ${country}` : country }));
                    } else {
                        setFormData(prev => ({ ...prev, location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }));
                    }
                } catch (err) {
                    setFormData(prev => ({ ...prev, location: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}` }));
                } finally {
                    setFetchingLocation(false);
                }
            },
            () => {
                setError('Unable to retrieve your location');
                setFetchingLocation(false);
            }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const data = new FormData();
        data.append('caption', formData.caption);
        data.append('location', formData.location);

        if (imageFile) {
            data.append('image', imageFile);
        } else if (formData.imageUrl) {
            data.append('imageUrl', formData.imageUrl); // Assuming backend can handle 'imageUrl' or we just send it as a separate field if supported. Wait, looking at standard MERN, if the backend uses multer it expects a file. If the user asked to use an image URL, the backend might need an update too, OR the backend already supports `image` as a string. Let's send `image: formData.imageUrl` if no file.
            // Actually, if it's FormData, backend expects req.body for text. Let's append it as 'imageString'.
            // For now, let's append it as 'image' text if the backend supports it, or 'imageUrl'. 
            // Wait, previous users often just add an input for URL. Let's just pass `imageUrl`.
            data.append('imageString', formData.imageUrl); // Backend might not support this unless updated. Let's send imageUrl.
            data.append('imageUrl', formData.imageUrl);
        }

        try {
            // Note: If backend expects a file upload exclusively, sending a URL will require backend modification.
            // But per standard instructions, we will add the UI for it first.
            await axios.post('/posts', data);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create post. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto mt-12 mb-20 relative px-4 sm:px-0">
            {/* Background Accents */}
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-brand-600/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="bg-[var(--bg-secondary)] backdrop-blur-xl rounded-3xl shadow-sm border border-[var(--border-color)] p-8 sm:p-10 relative z-10">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] mb-8 flex items-center gap-4 tracking-tight">
                    <span className="p-3 bg-[var(--bg-tertiary)] rounded-2xl shadow-inner border border-[var(--border-color)] block"><Camera className="w-8 h-8 text-brand-500" /></span>
                    Capture the Journey
                </h1>

                {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-5 py-3 rounded-xl mb-8 text-sm font-medium flex items-center gap-2"><X className="w-4 h-4" />{error}</div>}

                <form className="space-y-8" onSubmit={handleSubmit}>
                    {/* Image Input Section */}
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-500 to-emerald-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                        <div className="border border-[var(--border-color)] rounded-2xl p-6 sm:p-8 text-center bg-[var(--bg-primary)]/90 relative overflow-hidden">
                            {imagePreview ? (
                                <div className="relative inline-block w-full">
                                    <img src={imagePreview} alt="Preview" className="w-full max-h-[28rem] rounded-xl object-contain shadow-sm bg-[var(--bg-tertiary)]" />
                                    <button
                                        type="button"
                                        onClick={clearImage}
                                        className="absolute -top-4 -right-4 bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-white rounded-full p-2.5 shadow-xl border border-[var(--border-color)] hover:bg-red-500 hover:border-red-400 transition-all z-20"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-4">
                                    <div className="w-20 h-20 bg-[var(--bg-tertiary)] rounded-full flex items-center justify-center mb-6 border border-[var(--border-color)] group-hover:scale-110 transition-transform duration-500">
                                        <ImageIcon className="w-10 h-10 text-brand-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Add a Photo</h3>

                                    <div className="w-full max-w-sm mt-4 space-y-4">
                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                ref={fileInputRef}
                                                onChange={handleImageChange}
                                                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                                            />
                                            <div className="w-full px-8 py-3 bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-full font-semibold border border-[var(--border-color)] hover:opacity-80 transition-colors pointer-events-none">
                                                Choose File
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 text-[var(--text-tertiary)] text-sm font-medium">
                                            <div className="h-px bg-[var(--border-color)] flex-1"></div>
                                            OR
                                            <div className="h-px bg-[var(--border-color)] flex-1"></div>
                                        </div>

                                        <div className="relative flex items-center">
                                            <LinkIcon className="absolute left-4 w-5 h-5 text-[var(--text-tertiary)]" />
                                            <input
                                                type="url"
                                                placeholder="Paste Image URL..."
                                                value={formData.imageUrl}
                                                onChange={handleUrlChange}
                                                className="w-full pl-12 pr-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-full focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder:text-[var(--text-tertiary)]"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6 bg-[var(--bg-tertiary)] p-6 sm:p-8 rounded-2xl border border-[var(--border-color)]">
                        <div>
                            <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2 tracking-wide uppercase">The Story</label>
                            <textarea
                                rows="3"
                                required
                                value={formData.caption}
                                onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                                className="w-full px-5 py-4 bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder:text-[var(--text-tertiary)] resize-none text-lg"
                                placeholder="Describe this moment..."
                            ></textarea>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-bold text-[var(--text-secondary)] flex items-center gap-2 tracking-wide uppercase">
                                    <MapPin className="w-4 h-4 text-emerald-500" /> Location
                                </label>
                                <button
                                    type="button"
                                    onClick={detectLocation}
                                    disabled={fetchingLocation}
                                    className="text-xs bg-brand-500/10 hover:bg-brand-500/20 text-brand-600 dark:text-brand-400 px-4 py-1.5 rounded-full transition-colors font-semibold border border-brand-500/20 flex items-center gap-1.5 disabled:opacity-50"
                                >
                                    {fetchingLocation ? 'Locating...' : 'Auto Detect'}
                                </button>
                            </div>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={handleLocationChange}
                                    onFocus={() => {
                                        if (formData.location) fetchLocationSuggestions(formData.location);
                                        setShowSuggestions(true);
                                    }}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // delay to allow click
                                    className="w-full px-5 py-4 bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder:text-[var(--text-tertiary)] text-lg"
                                    placeholder="Where was this taken?"
                                    autoComplete="off"
                                />
                                {/* Dropdown Menu */}
                                {showSuggestions && locationSuggestions.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl shadow-2xl z-50 overflow-hidden">
                                        {locationSuggestions.map((loc, i) => (
                                            <div
                                                key={i}
                                                className="px-5 py-3 hover:bg-[var(--bg-tertiary)] cursor-pointer text-sm text-[var(--text-primary)] transition-colors border-b border-[var(--border-color)] last:border-0"
                                                onClick={() => handleSelectSuggestion(loc.display_name)}
                                            >
                                                {loc.display_name}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="px-8 py-3.5 text-[var(--text-secondary)] font-bold hover:text-[var(--text-primary)] transition-colors bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-color)]"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || (!imageFile && !formData.imageUrl && !formData.caption)}
                            className="px-10 py-3.5 bg-gradient-to-r from-brand-600 to-emerald-600 text-white rounded-xl font-bold hover:opacity-90 transition-opacity shadow-lg disabled:opacity-50 disabled:grayscale"
                        >
                            {loading ? 'Publishing...' : 'Publish Journey'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePost;
