import React, { useState } from 'react';
import {
    likePost, getComments, createComment, likeComment,
    getReplies, createReply, likeReply, getPostLikers, updatePostPrivacy
} from '../../services/postService';

// Generates a consistent color from a name string
const nameToColor = (name = '') => {
    const colors = [
        '#4f9cf9', '#f97316', '#22c55e', '#a855f7',
        '#ef4444', '#14b8a6', '#f59e0b', '#3b82f6',
        '#ec4899', '#06b6d4', '#84cc16', '#8b5cf6',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
};

// Initials avatar — consistent color per name, no image needed
const Avatar = ({ name = '', size = 38, style = {} }) => {
    const initials = name
        .split(' ')
        .map(w => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || '?';
    return (
        <div style={{
            width: size, height: size, borderRadius: '50%',
            background: nameToColor(name),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700,
            fontSize: size * 0.38,
            flexShrink: 0,
            userSelect: 'none',
            ...style
        }}>
            {initials}
        </div>
    );
};

const timeAgo = (dateStr) => {
    const diff = (Date.now() - new Date(dateStr)) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
};

// ----- Reply Component -----
const Reply = ({ reply, postId, commentId }) => {
    const [liked, setLiked] = useState(reply.isLiked);
    const [likesCount, setLikesCount] = useState(reply.likesCount);

    const handleLike = async () => {
        try {
            const res = await likeReply(postId, commentId, reply._id);
            setLiked(res.liked);
            setLikesCount(res.likesCount);
        } catch (e) { /* silent */ }
    };

    return (
        <div className="_comment_main" style={{ paddingLeft: 40 }}>
            <div className="_comment_image">
                <a href="#0" className="_comment_image_link">
                    <Avatar name={reply.authorName} size={36} />
                </a>
            </div>
            <div className="_comment_area">
                <div className="_comment_details">
                    <div className="_comment_details_top">
                        <div className="_comment_name">
                            <h4 className="_comment_name_title">{reply.authorName}</h4>
                        </div>
                    </div>
                    <div className="_comment_status">
                        <p className="_comment_status_text"><span>{reply.content}</span></p>
                    </div>
                    <div className="_comment_reply">
                        <div className="_comment_reply_num">
                            <ul className="_comment_reply_list">
                                <li>
                                    <span
                                        onClick={handleLike}
                                        style={{ color: liked ? '#1890FF' : undefined, fontWeight: liked ? 700 : undefined }}
                                    >
                                        {liked ? 'Liked' : 'Like'}{likesCount > 0 ? ` (${likesCount})` : ''}.
                                    </span>
                                </li>
                                <li><span className="_time_link">.{timeAgo(reply.createdAt)}</span></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ----- Comment Component -----
const Comment = ({ comment, postId }) => {
    const [liked, setLiked] = useState(comment.isLiked);
    const [likesCount, setLikesCount] = useState(comment.likesCount);
    const [showReplies, setShowReplies] = useState(false);
    const [replies, setReplies] = useState([]);
    const [loadingReplies, setLoadingReplies] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [submittingReply, setSubmittingReply] = useState(false);

    const handleLike = async () => {
        try {
            const res = await likeComment(postId, comment._id);
            setLiked(res.liked);
            setLikesCount(res.likesCount);
        } catch (e) { /* silent */ }
    };

    const handleShowReplies = async () => {
        if (!showReplies && replies.length === 0 && comment.repliesCount > 0) {
            setLoadingReplies(true);
            try {
                const data = await getReplies(postId, comment._id);
                setReplies(data.replies);
            } catch (e) { /* silent */ } finally { setLoadingReplies(false); }
        }
        setShowReplies(!showReplies);
    };

    const handleReplySubmit = async (e) => {
        e.preventDefault();
        if (!replyText.trim() || submittingReply) return;
        setSubmittingReply(true);
        try {
            const newReply = await createReply(postId, comment._id, replyText.trim());
            setReplies(prev => [...prev, { ...newReply, isLiked: false, likesCount: 0 }]);
            setReplyText('');
            setShowReplies(true);
            setShowReplyInput(false);
        } catch (e) { /* silent */ } finally { setSubmittingReply(false); }
    };

    return (
        <div className="_comment_main">
            <div className="_comment_image">
                <a href="#0" className="_comment_image_link">
                    <Avatar name={comment.authorName} size={36} />
                </a>
            </div>
            <div className="_comment_area">
                <div className="_comment_details">
                    <div className="_comment_details_top">
                        <div className="_comment_name">
                            <h4 className="_comment_name_title">{comment.authorName}</h4>
                        </div>
                    </div>
                    <div className="_comment_status">
                        <p className="_comment_status_text"><span>{comment.content}</span></p>
                    </div>
                    {likesCount > 0 && (
                        <div className="_total_reactions">
                            <div className="_total_react">
                                <span className="_reaction_like">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-thumbs-up"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                                </span>
                            </div>
                            <span className="_total">{likesCount}</span>
                        </div>
                    )}
                    <div className="_comment_reply">
                        <div className="_comment_reply_num">
                            <ul className="_comment_reply_list" style={{ flexWrap: 'nowrap', whiteSpace: 'nowrap' }}>
                                <li>
                                    <span
                                        onClick={handleLike}
                                        style={{ color: liked ? '#1890FF' : undefined, fontWeight: liked ? 700 : undefined, whiteSpace: 'nowrap' }}
                                    >
                                        {liked ? 'Liked' : 'Like'}.
                                    </span>
                                </li>
                                <li>
                                    <span onClick={() => setShowReplyInput(!showReplyInput)} style={{ whiteSpace: 'nowrap' }}>Reply.</span>
                                </li>
                                {comment.repliesCount > 0 && (
                                    <li>
                                        <span onClick={handleShowReplies} style={{ color: '#1890FF', whiteSpace: 'nowrap' }}>
                                            {showReplies ? 'Hide replies' : `View ${comment.repliesCount} repl${comment.repliesCount > 1 ? 'ies' : 'y'}`}
                                        </span>
                                    </li>
                                )}
                                <li><span className="_time_link" style={{ whiteSpace: 'nowrap' }}>.{timeAgo(comment.createdAt)}</span></li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Reply Input */}
                {showReplyInput && (
                    <div className="_feed_inner_comment_box" style={{ marginTop: 8 }}>
                        <form className="_feed_inner_comment_box_form" onSubmit={handleReplySubmit}>
                            <div className="_feed_inner_comment_box_content">
                                <div className="_feed_inner_comment_box_content_image">
                                    <Avatar name={JSON.parse(localStorage.getItem('user') || '{}').firstName || 'U'} size={36} />
                                </div>
                                <div className="_feed_inner_comment_box_content_txt">
                                    <textarea
                                        className="form-control _comment_textarea"
                                        placeholder="Write a reply"
                                        value={replyText}
                                        onChange={e => setReplyText(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReplySubmit(e); } }}
                                    ></textarea>
                                </div>
                            </div>
                            <div className="_feed_inner_comment_box_icon">
                                <button type="submit" disabled={submittingReply} className="_feed_inner_comment_box_icon_btn" style={{ opacity: submittingReply ? 0.6 : 1 }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
                                        <path fill="#000" fillOpacity=".46" fillRule="evenodd" d="M13.167 6.534a.5.5 0 01.5.5c0 3.061-2.35 5.582-5.333 5.837V14.5a.5.5 0 01-1 0v-1.629C4.35 12.616 2 10.096 2 7.034a.5.5 0 011 0c0 2.679 2.168 4.859 4.833 4.859 2.666 0 4.834-2.18 4.834-4.86a.5.5 0 01.5-.5zM7.833.667a3.218 3.218 0 013.208 3.22v3.126c0 1.775-1.439 3.22-3.208 3.22a3.218 3.218 0 01-3.208-3.22V3.887c0-1.776 1.44-3.22 3.208-3.22zm0 1a2.217 2.217 0 00-2.208 2.22v3.126c0 1.223.991 2.22 2.208 2.22a2.217 2.217 0 002.208-2.22V3.887c0-1.224-.99-2.22-2.208-2.22z" clipRule="evenodd"></path>
                                    </svg>
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Replies list */}
                {loadingReplies && <p className="_previous_comment_txt" style={{ paddingLeft: 40 }}>Loading replies...</p>}
                {showReplies && replies.map(reply => (
                    <Reply key={reply._id} reply={reply} postId={postId} commentId={comment._id} />
                ))}
            </div>
        </div>
    );
};

// ----- Main TimelinePost Component -----
const TimelinePost = ({ post }) => {
    const [isTimelineDropShow, setTimelineDropShow] = useState(false);
    const [liked, setLiked] = useState(post?.isLiked || false);
    const [likesCount, setLikesCount] = useState(post?.likesCount || 0);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [commentsCount, setCommentsCount] = useState(post?.commentsCount || 0);
    const [showLikers, setShowLikers] = useState(false);
    const [likers, setLikers] = useState([]);
    const [privacy, setPrivacy] = useState(post?.privacy || 'public');

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const authorIdStr = post.authorId?.$oid || (typeof post.authorId === 'string' ? post.authorId : post.authorId?.toString());
    const isOwner = authorIdStr === user.id || post.authorName === `${user.firstName || ''} ${user.lastName || ''}`.trim();

    const handlePrivacyChange = async (newVal) => {
        if (!isOwner) return;
        try {
            const actualPostId = post._id?.$oid || post._id; // Ensure string ID
            const data = await updatePostPrivacy(actualPostId, newVal);
            setPrivacy(data.privacy);
        } catch (e) {
            console.error('Failed to change privacy', e);
        }
    };

    const imageUrl = post?.imageUrl || null;  // Full ImgBB URL stored in MongoDB

    const handleLike = async () => {
        try {
            const res = await likePost(post._id);
            setLiked(res.liked);
            setLikesCount(res.likesCount);
            setShowLikers(false);
        } catch (e) { /* silent */ }
    };

    const handleShowLikers = async () => {
        if (likesCount === 0) return;
        if (!showLikers && likers.length === 0) {
            try {
                const data = await getPostLikers(post._id);
                setLikers(data.likers);
            } catch (e) { /* silent */ }
        }
        setShowLikers(!showLikers);
    };

    const handleToggleComments = async () => {
        if (!showComments && comments.length === 0) {
            setLoadingComments(true);
            try {
                const data = await getComments(post._id);
                setComments(data.comments);
            } catch (e) { /* silent */ } finally { setLoadingComments(false); }
        }
        setShowComments(!showComments);
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentText.trim() || submittingComment) return;
        setSubmittingComment(true);
        try {
            const newComment = await createComment(post._id, commentText.trim());
            setComments(prev => [{ ...newComment, isLiked: false, likesCount: 0, repliesCount: 0 }, ...prev]);
            setCommentText('');
            setCommentsCount(prev => prev + 1);
            setShowComments(true);
        } catch (e) { /* silent */ } finally { setSubmittingComment(false); }
    };

    return (
        <div className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16">
            <div className="_feed_inner_timeline_content _padd_r24 _padd_l24">
                <div className="_feed_inner_timeline_post_top">
                    <div className="_feed_inner_timeline_post_box">
                        <div className="_feed_inner_timeline_post_box_image">
                            <Avatar name={post?.authorName} size={44} />
                        </div>
                        <div className="_feed_inner_timeline_post_box_txt">
                            <h4 className="_feed_inner_timeline_post_box_title">{post?.authorName || 'Unknown'}</h4>
                            <p className="_feed_inner_timeline_post_box_para">
                                {post?.createdAt ? timeAgo(post.createdAt) : ''} .{' '}
                                <select 
                                    value={privacy}
                                    onChange={(e) => handlePrivacyChange(e.target.value)}
                                    disabled={!isOwner}
                                    style={{
                                        border: 'none',
                                        background: 'none',
                                        outline: 'none',
                                        padding: 0,
                                        margin: '0 0 0 4px',
                                        color: '#377dff',
                                        fontSize: 'inherit',
                                        fontFamily: 'inherit',
                                        cursor: isOwner ? 'pointer' : 'default',
                                        appearance: 'none',
                                        WebkitAppearance: 'none'
                                    }}
                                >
                                    <option value="public" style={{ color: '#000' }}>Public</option>
                                    <option value="private" style={{ color: '#000' }}>Private</option>
                                </select>
                            </p>
                        </div>
                    </div>
                    <div className="_feed_inner_timeline_post_box_dropdown">
                        <div className="_feed_timeline_post_dropdown">
                            <button type="button" className="_feed_timeline_post_dropdown_link" onClick={() => setTimelineDropShow(!isTimelineDropShow)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="4" height="17" fill="none" viewBox="0 0 4 17">
                                    <circle cx="2" cy="2" r="2" fill="#C4C4C4"></circle>
                                    <circle cx="2" cy="8" r="2" fill="#C4C4C4"></circle>
                                    <circle cx="2" cy="15" r="2" fill="#C4C4C4"></circle>
                                </svg>
                            </button>
                        </div>
                        <div className={`_feed_timeline_dropdown ${isTimelineDropShow ? 'show' : ''}`}>
                            <ul className="_feed_timeline_dropdown_list">
                                <li className="_feed_timeline_dropdown_item">
                                    <a href="#0" className="_feed_timeline_dropdown_link">
                                        <span>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 18 18">
                                                <path stroke="#1890FF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M14.25 15.75L9 12l-5.25 3.75v-12a1.5 1.5 0 011.5-1.5h7.5a1.5 1.5 0 011.5 1.5v12z"></path>
                                            </svg>
                                        </span>
                                        Save Post
                                    </a>
                                </li>
                                <li className="_feed_timeline_dropdown_item">
                                    <a href="#0" className="_feed_timeline_dropdown_link">
                                        <span>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="22" fill="none" viewBox="0 0 20 22">
                                                <path fill="#377DFF" fillRule="evenodd" d="M7.547 19.55c.533.59 1.218.915 1.93.915.714 0 1.403-.324 1.938-.916a.777.777 0 011.09-.056c.318.284.344.77.058 1.084-.832.917-1.927 1.423-3.086 1.423h-.002c-1.155-.001-2.248-.506-3.077-1.424a.762.762 0 01.057-1.083.774.774 0 011.092.057zM9.527 0c4.58 0 7.657 3.543 7.657 6.85 0 1.702.436 2.424.899 3.19.457.754.976 1.612.976 3.233-.36 4.14-4.713 4.478-9.531 4.478-4.818 0-9.172-.337-9.528-4.413-.003-1.686.515-2.544.973-3.299l.161-.27c.398-.679.737-1.417.737-2.918C1.871 3.543 4.948 0 9.528 0zm0 1.535c-3.6 0-6.11 2.802-6.11 5.316 0 2.127-.595 3.11-1.12 3.978-.422.697-.755 1.247-.755 2.444.173 1.93 1.455 2.944 7.986 2.944 6.494 0 7.817-1.06 7.988-3.01-.003-1.13-.336-1.681-.757-2.378-.526-.868-1.12-1.851-1.12-3.978 0-2.514-2.51-5.316-6.111-5.316z" clipRule="evenodd"></path>
                                            </svg>
                                        </span>
                                        Turn On Notification
                                    </a>
                                </li>
                                <li className="_feed_timeline_dropdown_item">
                                    <a href="#0" className="_feed_timeline_dropdown_link">
                                        <span>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 18 18">
                                                <path stroke="#1890FF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M14.25 2.25H3.75a1.5 1.5 0 00-1.5 1.5v10.5a1.5 1.5 0 001.5 1.5h10.5a1.5 1.5 0 001.5-1.5V3.75a1.5 1.5 0 00-1.5-1.5zM6.75 6.75l4.5 4.5M11.25 6.75l-4.5 4.5"></path>
                                            </svg>
                                        </span>
                                        Hide
                                    </a>
                                </li>
                                <li className="_feed_timeline_dropdown_item">
                                    <a href="#0" className="_feed_timeline_dropdown_link">
                                        <span>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 18 18">
                                                <path stroke="#1890FF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M8.25 3H3a1.5 1.5 0 00-1.5 1.5V15A1.5 1.5 0 003 16.5h10.5A1.5 1.5 0 0015 15V9.75"></path>
                                                <path stroke="#1890FF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M13.875 1.875a1.591 1.591 0 112.25 2.25L9 11.25 6 12l.75-3 7.125-7.125z"></path>
                                            </svg>
                                        </span>
                                        Edit Post
                                    </a>
                                </li>
                                <li className="_feed_timeline_dropdown_item">
                                    <a href="#0" className="_feed_timeline_dropdown_link">
                                        <span>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 18 18">
                                                <path stroke="#1890FF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M2.25 4.5h13.5M6 4.5V3a1.5 1.5 0 011.5-1.5h3A1.5 1.5 0 0112 3v1.5m2.25 0V15a1.5 1.5 0 01-1.5 1.5h-7.5a1.5 1.5 0 01-1.5-1.5V4.5h10.5zM7.5 8.25v4.5M10.5 8.25v4.5"></path>
                                            </svg>
                                        </span>
                                        Delete Post
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Post Title (content) */}
                {post?.content && (
                    <h4 className="_feed_inner_timeline_post_title">{post.content}</h4>
                )}

                {/* Post Image */}
                {imageUrl && (
                    <div className="_feed_inner_timeline_image">
                        <img src={imageUrl} alt="" className="_time_img" style={{ width: '100%', borderRadius: 8, objectFit: 'cover' }} />
                    </div>
                )}
            </div>

            {/* Reactions count row */}
            <div className="_feed_inner_timeline_total_reacts _padd_r24 _padd_l24 _mar_b26">
                <div className="_feed_inner_timeline_total_reacts_image">
                    <img src="assets/images/react_img1.png" alt="Image" className="_react_img1" />
                    <img src="assets/images/react_img2.png" alt="Image" className="_react_img" />
                    <img src="assets/images/react_img3.png" alt="Image" className="_react_img _rect_img_mbl_none" />
                    <button onClick={handleShowLikers} style={{ background: 'none', border: 'none', cursor: likesCount > 0 ? 'pointer' : 'default', padding: 0 }}>
                        <p className="_feed_inner_timeline_total_reacts_para">{likesCount > 0 ? likesCount : ''}</p>
                    </button>
                </div>
                <div className="_feed_inner_timeline_total_reacts_txt">
                    <p className="_feed_inner_timeline_total_reacts_para1">
                        <button onClick={handleToggleComments} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit' }}>
                            <span>{commentsCount}</span> Comment{commentsCount !== 1 ? 's' : ''}
                        </button>
                    </p>
                </div>
            </div>

            {/* Who liked popup */}
            {showLikers && likers.length > 0 && (
                <div style={{ margin: '0 24px 12px', background: '#f5f7fa', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
                    <strong>Liked by:</strong>
                    {likers.map(u => (
                        <div key={u._id} style={{ padding: '2px 0' }}>{u.firstName} {u.lastName}</div>
                    ))}
                </div>
            )}

            {/* Reaction buttons row */}
            <div className="_feed_inner_timeline_reaction">
                <button
                    className={`_feed_inner_timeline_reaction_emoji _feed_reaction ${liked ? '_feed_reaction_active' : ''}`}
                    onClick={handleLike}
                >
                    <span className="_feed_inner_timeline_reaction_link">
                        <span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" fill="none" viewBox="0 0 19 19">
                                <path fill="#FFCC4D" d="M9.5 19a9.5 9.5 0 100-19 9.5 9.5 0 000 19z"></path>
                                <path fill="#664500" d="M9.5 11.083c-1.912 0-3.181-.222-4.75-.527-.358-.07-1.056 0-1.056 1.055 0 2.111 2.425 4.75 5.806 4.75 3.38 0 5.805-2.639 5.805-4.75 0-1.055-.697-1.125-1.055-1.055-1.57.305-2.838.527-4.75.527z"></path>
                                <path fill="#fff" d="M4.75 11.611s1.583.528 4.75.528 4.75-.528 4.75-.528-1.056 2.111-4.75 2.111-4.75-2.11-4.75-2.11z"></path>
                                <path fill="#664500" d="M6.333 8.972c.729 0 1.32-.827 1.32-1.847s-.591-1.847-1.32-1.847c-.729 0-1.32.827-1.32 1.847s.591 1.847 1.32 1.847zM12.667 8.972c.729 0 1.32-.827 1.32-1.847s-.591-1.847-1.32-1.847c-.729 0-1.32.827-1.32 1.847s.591 1.847 1.32 1.847z"></path>
                            </svg>
                            {liked ? 'Liked' : 'Haha'}
                        </span>
                    </span>
                </button>

                <button className="_feed_inner_timeline_reaction_comment _feed_reaction" onClick={handleToggleComments}>
                    <span className="_feed_inner_timeline_reaction_link">
                        <span>
                            <svg className="_reaction_svg" xmlns="http://www.w3.org/2000/svg" width="21" height="21" fill="none" viewBox="0 0 21 21">
                                <path stroke="#000" d="M1 10.5c0-.464 0-.696.009-.893A9 9 0 019.607 1.01C9.804 1 10.036 1 10.5 1v0c.464 0 .696 0 .893.009a9 9 0 018.598 8.598c.009.197.009.429.009.893v6.046c0 1.36 0 2.041-.317 2.535a2 2 0 01-.602.602c-.494.317-1.174.317-2.535.317H10.5c-.464 0-.696 0-.893-.009a9 9 0 01-8.598-8.598C1 11.196 1 10.964 1 10.5v0z"></path>
                                <path stroke="#000" strokeLinecap="round" strokeLinejoin="round" d="M6.938 9.313h7.125M10.5 14.063h3.563"></path>
                            </svg>
                            Comment
                        </span>
                    </span>
                </button>

                <button className="_feed_inner_timeline_reaction_share _feed_reaction">
                    <span className="_feed_inner_timeline_reaction_link">
                        <span>
                            <svg className="_reaction_svg" xmlns="http://www.w3.org/2000/svg" width="24" height="21" fill="none" viewBox="0 0 24 21">
                                <path stroke="#000" strokeLinejoin="round" d="M23 10.5L12.917 1v5.429C3.267 6.429 1 13.258 1 20c2.785-3.52 5.248-5.429 11.917-5.429V20L23 10.5z"></path>
                            </svg>
                            Share
                        </span>
                    </span>
                </button>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="_feed_inner_timeline_cooment_area">
                    {/* Comment input */}
                    <div className="_feed_inner_comment_box">
                        <form className="_feed_inner_comment_box_form" onSubmit={handleCommentSubmit}>
                            <div className="_feed_inner_comment_box_content">
                                <div className="_feed_inner_comment_box_content_image">
                                    <Avatar name={JSON.parse(localStorage.getItem('user') || '{}').firstName || 'U'} size={36} />
                                </div>
                                <div className="_feed_inner_comment_box_content_txt">
                                    <textarea
                                        className="form-control _comment_textarea"
                                        placeholder="Write a comment"
                                        value={commentText}
                                        onChange={e => setCommentText(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleCommentSubmit(e); } }}
                                    ></textarea>
                                </div>
                            </div>
                            <div className="_feed_inner_comment_box_icon">
                                <button type="submit" disabled={submittingComment} className="_feed_inner_comment_box_icon_btn" style={{ opacity: submittingComment ? 0.6 : 1 }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
                                        <path fill="#000" fillOpacity=".46" fillRule="evenodd" d="M13.167 6.534a.5.5 0 01.5.5c0 3.061-2.35 5.582-5.333 5.837V14.5a.5.5 0 01-1 0v-1.629C4.35 12.616 2 10.096 2 7.034a.5.5 0 011 0c0 2.679 2.168 4.859 4.833 4.859 2.666 0 4.834-2.18 4.834-4.86a.5.5 0 01.5-.5zM7.833.667a3.218 3.218 0 013.208 3.22v3.126c0 1.775-1.439 3.22-3.208 3.22a3.218 3.218 0 01-3.208-3.22V3.887c0-1.776 1.44-3.22 3.208-3.22zm0 1a2.217 2.217 0 00-2.208 2.22v3.126c0 1.223.991 2.22 2.208 2.22a2.217 2.217 0 002.208-2.22V3.887c0-1.224-.99-2.22-2.208-2.22z" clipRule="evenodd"></path>
                                    </svg>
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="_timline_comment_main">
                        {loadingComments && (
                            <div className="_previous_comment">
                                <button type="button" className="_previous_comment_txt">Loading comments...</button>
                            </div>
                        )}

                        {!loadingComments && comments.length === 0 && (
                            <div className="_previous_comment">
                                <p style={{ fontSize: 13, color: '#999', padding: '8px 0' }}>No comments yet. Be the first!</p>
                            </div>
                        )}

                        {comments.map(comment => (
                            <Comment key={comment._id} comment={comment} postId={post._id} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TimelinePost;
