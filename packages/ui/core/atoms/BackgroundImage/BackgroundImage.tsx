interface FloatingElement {
  position: string;
  size: string;
  gradient: string;
  blur: string;
  animationDelay?: string;
}

interface BackgroundImageProps {
  src: string;
  opacity?: number;
  position?: string;
  size?: string;
  repeat?: string;
  showFloatingElements?: boolean;
  floatingElements?: FloatingElement[];
}

const defaultFloatingElements: FloatingElement[] = [
  {
    position: 'top-0 left-1/4',
    size: 'w-96 h-96',
    gradient: 'from-purple-400/10 to-pink-400/15',
    blur: 'blur-3xl',
  },
  {
    position: 'bottom-0 right-1/4',
    size: 'w-80 h-80',
    gradient: 'from-blue-400/12 to-cyan-400/20',
    blur: 'blur-3xl',
    animationDelay: '2s',
  },
  {
    position: 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
    size: 'w-72 h-72',
    gradient: 'from-indigo-400/8 to-violet-400/15',
    blur: 'blur-2xl',
    animationDelay: '1s',
  },
  {
    position: 'top-1/4 right-1/3',
    size: 'w-64 h-64',
    gradient: 'from-rose-400/10 to-orange-400/12',
    blur: 'blur-2xl',
    animationDelay: '3s',
  },
  {
    position: 'bottom-1/3 left-1/6',
    size: 'w-88 h-88',
    gradient: 'from-teal-400/8 to-emerald-400/15',
    blur: 'blur-2xl',
    animationDelay: '1.5s',
  },
];

export const BackgroundImage = ({
  src,
  opacity = 60,
  position = 'center',
  size = 'cover',
  repeat = 'no-repeat',
  showFloatingElements = false,
  floatingElements = defaultFloatingElements,
}: BackgroundImageProps) => {
  return (
    <div data-component="background-image">
      {/* 背景画像 */}
      <div
        className={`absolute inset-0 opacity-${opacity}`}
        style={{
          backgroundImage: `url(${src})`,
          backgroundSize: size,
          backgroundPosition: position,
          backgroundRepeat: repeat,
        }}
      />

      {/* フローティング要素 */}
      {showFloatingElements &&
        floatingElements.map((element, index) => (
          <div
            key={index}
            className={`absolute ${element.position} ${element.size} bg-gradient-to-r ${element.gradient} rounded-full ${element.blur} animate-pulse`}
            style={
              element.animationDelay
                ? { animationDelay: element.animationDelay }
                : undefined
            }
          />
        ))}
    </div>
  );
};
