import Image from 'next/image';

const PygameIcon = ({ className, ...props }) => (
  <Image
    src="/images/tech-icons/pygame.svg"
    alt=""
    width={48}
    height={48}
    unoptimized
    className={className}
    draggable={false}
    {...props}
  />
);
export default PygameIcon;
