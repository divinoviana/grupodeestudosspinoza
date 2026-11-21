import React, { useEffect, useState } from 'react';

interface AvatarProps {
  name: string;
  url?: string | null;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ name, url, className = 'w-8 h-8 text-xs' }) => {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [url]);
  const initial = (name.trim()[0] || '?').toUpperCase();

  if (url && !failed) {
    return (
      <img
        src={url}
        alt={name}
        onError={() => setFailed(true)}
        className={`${className} rounded-full object-cover shrink-0`}
      />
    );
  }

  return (
    <div className={`${className} rounded-full bg-[#0f172a] text-[#d4af37] flex items-center justify-center font-bold shrink-0`}>
      {initial}
    </div>
  );
};

export default Avatar;
