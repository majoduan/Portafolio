import Image from 'next/image';

const PygameIcon = ({ className, ...props }) => (
  <Image
    src="/media/tech/pygame.avif"
    alt=""
    width={128}
    height={128}
    unoptimized
    className={className}
    draggable={false}
    {...props}
  />
);
export default PygameIcon;
