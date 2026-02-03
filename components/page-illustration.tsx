// components/page-illustration.tsx

import Image from "next/image";
import Illustration from "@/public/images/page-illustration.svg";
import BlurredShapeGray from "@/public/images/blurred-shape-gray.svg";
import BlurredShape from "@/public/images/blurred-shape.svg";

interface PageIllustrationProps {
    multiple?: boolean;
    className?: string;
}

export default function PageIllustration({
                                             multiple = false,
                                             className = "",
                                         }: PageIllustrationProps) {
    return (
        <>
            {/* Ilustração principal */}
            <div
                className={`
          pointer-events-none
          absolute
          left-1/2
          top-0
          -z-10
          -translate-x-1/4
          opacity-90
          transition-all
          duration-500
          ${className}
        `}
                aria-hidden="true"
            >
                <Image
                    className="max-w-none"
                    src={Illustration}
                    width={846}
                    height={594}
                    priority
                    alt=""
                />
            </div>

            {multiple && (
                <>
                    {/* Forma desfocada cinza */}
                    <div
                        className="
              pointer-events-none
              absolute
              left-1/2
              top-[400px]
              -z-10
              -mt-20
              -translate-x-full
              opacity-40
              blur-lg
              transition-opacity
              duration-700
            "
                        aria-hidden="true"
                    >
                        <Image
                            className="max-w-none"
                            src={BlurredShapeGray}
                            width={760}
                            height={668}
                            alt=""
                        />
                    </div>

                    {/* Forma desfocada azul */}
                    <div
                        className="
              pointer-events-none
              absolute
              left-1/2
              top-[440px]
              -z-10
              -translate-x-1/3
              opacity-50
              blur-xl
              transition-opacity
              duration-700
            "
                        aria-hidden="true"
                    >
                        <Image
                            className="max-w-none"
                            src={BlurredShape}
                            width={760}
                            height={668}
                            alt=""
                        />
                    </div>
                </>
            )}
        </>
    );
}