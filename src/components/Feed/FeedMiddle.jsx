import React, { useState, useEffect, useCallback } from 'react';
import StoryCarousel from './StoryCarousel';
import CreatePost from './CreatePost';
import TimelinePost from './TimelinePost';
import { getPosts } from '../../services/postService';

const FeedMiddle = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const fetchPosts = useCallback(async (pageNum = 1, append = false) => {
        try {
            const data = await getPosts(pageNum, 10);
            if (append) {
                setPosts(prev => [...prev, ...data.posts]);
            } else {
                setPosts(data.posts);
            }
            setHasMore(data.posts.length === 10);
        } catch (err) {
            setError('Failed to load posts. Please refresh.');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    useEffect(() => {
        fetchPosts(1, false);
    }, [fetchPosts]);

    const handlePostCreated = (newPost) => {
        // Prepend new post to the top
        setPosts(prev => [{
            ...newPost,
            isLiked: false,
            likesCount: 0,
            commentsCount: 0
        }, ...prev]);
    };

    const handleLoadMore = async () => {
        if (loadingMore || !hasMore) return;
        setLoadingMore(true);
        const nextPage = page + 1;
        setPage(nextPage);
        await fetchPosts(nextPage, true);
    };

    return (
        <>
            <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
                <div className="_layout_middle_wrap">
                    <div className="_layout_middle_inner">
                        <StoryCarousel />
                        <CreatePost onPostCreated={handlePostCreated} />

                        {loading && (
                            <div style={{
                                textAlign: 'center', padding: '40px 20px',
                                color: '#666', fontSize: 15
                            }}>
                                Loading posts...
                            </div>
                        )}

                        {error && (
                            <div style={{
                                textAlign: 'center', padding: '20px',
                                color: '#dc3545', fontSize: 14
                            }}>
                                {error}
                            </div>
                        )}

                        {!loading && posts.length === 0 && !error && (
                            <div style={{
                                textAlign: 'center', padding: '40px 20px',
                                color: '#999', fontSize: 15
                            }}>
                                No posts yet. Be the first to share something!
                            </div>
                        )}

                        {posts.map(post => (
                            <TimelinePost key={post._id} post={post} />
                        ))}

                        {hasMore && !loading && (
                            <div style={{ textAlign: 'center', padding: '16px 0' }}>
                                <button
                                    onClick={handleLoadMore}
                                    disabled={loadingMore}
                                    style={{
                                        background: '#fff', border: '1px solid #e0e0e0',
                                        borderRadius: 8, padding: '10px 28px',
                                        cursor: 'pointer', fontSize: 14, color: '#377DFF',
                                        fontWeight: 600
                                    }}
                                >
                                    {loadingMore ? 'Loading...' : 'Load More Posts'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default FeedMiddle;
