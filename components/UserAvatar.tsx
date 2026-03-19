import React from 'react';

export interface UserAvatarProps {
  user: {
    name?: string;
    avatar?: string;
    role?: string;
    specialization?: string | null;
  } | null;
  className?: string;
  previewUrl?: string | null;
}

export const getInitials = (name: string) => {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

export const getColorFromName = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 65%, 45%)`; 
};

export const getAvatarUrl = (avatar: string | undefined, role: string | undefined, spec: string | undefined | null) => {
  if (!avatar) return '';
  if (avatar.startsWith('http') || avatar.startsWith('data:')) return avatar;
  
  const baseUrl = (import.meta.env as any).VITE_API_URL || 'http://localhost:4001';
  
  if (role === 'AGENT' && spec) {
    return `${baseUrl}/products/${spec.toLowerCase()}/${avatar}`;
  }
  return `${baseUrl}/uploads/general/${avatar}`;
};

const UserAvatar: React.FC<UserAvatarProps> = ({ user, className = "w-10 h-10", previewUrl }) => {
  if (previewUrl) {
    return (
      <img 
        src={previewUrl} 
        alt="Preview" 
        className={`object-cover rounded-full ${className}`} 
      />
    );
  }

  if (!user) {
    return (
      <div className={`rounded-full bg-gray-200 flex items-center justify-center text-white font-bold shadow-inner ${className}`} style={{ backgroundColor: '#9ca3af' }}>
        U
      </div>
    );
  }

  if (user.avatar && user.avatar.length > 2) {
    return (
      <img 
        src={getAvatarUrl(user.avatar, user.role, user.specialization)} 
        alt={user.name || "Profile"} 
        className={`object-cover rounded-full ${className}`} 
      />
    );
  }

  return (
    <div 
      className={`rounded-full flex items-center justify-center text-white font-bold tracking-wider shadow-inner ${className}`} 
      style={{ backgroundColor: getColorFromName(user.name || 'User') }}
    >
      {getInitials(user.name || 'User')}
    </div>
  );
};

export default UserAvatar;
