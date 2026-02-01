declare module 'avataaars' {
  import * as React from 'react';

  export interface AvatarProps {
    avatarStyle?: string;
    topType?: string;
    accessoriesType?: string;
    hairColor?: string;
    facialHairType?: string;
    clotheType?: string;
    eyeType?: string;
    eyebrowType?: string;
    mouthType?: string;
    skinColor?: string;
    style?: React.CSSProperties;
    [key: string]: any;
  }

  export default class Avatar extends React.Component<AvatarProps> {}
}
