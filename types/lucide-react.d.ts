declare module 'lucide-react' {
  import { FC, SVGProps } from 'react';
  
  export interface IconProps extends SVGProps<SVGSVGElement> {
    size?: string | number;
    strokeWidth?: string | number;
  }
  
  export const Plus: FC<IconProps>;
  export const Edit: FC<IconProps>;
  export const Trash2: FC<IconProps>;
  export const MapPin: FC<IconProps>;
  export const Upload: FC<IconProps>;
  export const Search: FC<IconProps>;
  export const Loader2: FC<IconProps>;
  export const Check: FC<IconProps>;
  export const Globe: FC<IconProps>;
  export const AlertCircle: FC<IconProps>;
  export const ChevronUp: FC<IconProps>;
  export const ChevronDown: FC<IconProps>;
  export const List: FC<IconProps>;
  export const Map: FC<IconProps>;
  export const Clock: FC<IconProps>;
  export const ExternalLink: FC<IconProps>;
  export const ChevronLeft: FC<IconProps>;
  export const ChevronRight: FC<IconProps>;
  export const ArrowLeft: FC<IconProps>;
}

