import { useMemo } from 'react';
import Avatar from 'avataaars';

interface UserAvatarProps {
  username?: string;
  avatarConfig?: any;
  className?: string;
  size?: number | string;
}

export default function UserAvatar({ username, avatarConfig, className = "", size = "100%" }: UserAvatarProps) {
  
  const hasAvatar = useMemo(() => {
    return avatarConfig && Object.keys(avatarConfig).length > 0;
  }, [avatarConfig]);

  if (hasAvatar) {
    return (
      <div className={`overflow-hidden ${className}`} style={{ width: size, height: size }}>
         <Avatar
            style={{ width: '100%', height: '100%' }}
            avatarStyle="Transparent"
            {...avatarConfig}
        />
      </div>
    );
  }

  // Fallback to initials
  return (
    <div 
        className={`flex items-center justify-center bg-deepblue/5 text-deepblue font-paytone font-bold ${className}`}
        style={{ width: size, height: size }}
    >
        {username ? username.substring(0, 2).toUpperCase() : "??"}
    </div>
  );
}
