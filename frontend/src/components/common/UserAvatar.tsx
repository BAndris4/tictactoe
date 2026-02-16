import { useMemo } from 'react';
import Avatar from 'avataaars';

interface UserAvatarProps {
  username?: string;
  avatarConfig?: any;
  className?: string;
  size?: number | string;
}

export default function UserAvatar({ username, avatarConfig, className = "", size = "100%" }: UserAvatarProps) {
  const finalConfig = avatarConfig;

  const hasAvatar = useMemo(() => {
    return finalConfig && typeof finalConfig === 'object' && Object.keys(finalConfig).length > 0;
  }, [finalConfig]);

  if (hasAvatar) {
    return (
      <div className={`overflow-hidden ${className}`} style={{ width: size, height: size }}>
         <Avatar
            style={{ width: '100%', height: '100%' }}
            avatarStyle="Transparent"
            {...finalConfig}
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
