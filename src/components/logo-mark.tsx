import Image from 'next/image';

/** The header logo. Grows and wiggles on hover; reduced motion keeps only the grow. */
export function LogoMark(): React.ReactElement {
    return (
        <Image
            src="/logo.svg"
            alt=""
            width={26}
            height={26}
            unoptimized
            priority
            className="drop-shadow-[0_2px_3px_rgb(16_24_40/0.15)] transition-[scale] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-115 motion-safe:hover:animate-wiggle"
        />
    );
}
