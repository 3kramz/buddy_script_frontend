import React from 'react';
import StoryCarousel from './StoryCarousel';
import CreatePost from './CreatePost';
import TimelinePost from './TimelinePost';

const FeedMiddle = () => {
    return (
        <>
            <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
                <div className="_layout_middle_wrap">
                    <div className="_layout_middle_inner">
                        <StoryCarousel />
                        <CreatePost />
                        {/* Rendering multiple timeline posts here to mirror the previous view */}
                        <TimelinePost />
                        <TimelinePost />
                    </div>
                </div>
            </div>
        </>
    );
};

export default FeedMiddle;
