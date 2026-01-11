import React from 'react';

const Loader = ({ size = 'md' }) => {
    const sizes = {
        sm: 'h-6 w-6 border-2',
        md: 'h-12 w-12 border-t-2 border-b-2',
        lg: 'h-16 w-16 border-4',
    };

    return (
        <div className="min-h-[200px] flex items-center justify-center">
            <div className={`animate-spin rounded-full border-blue-500 ${sizes[size]}`}></div>
        </div>
    );
};

export default Loader;
