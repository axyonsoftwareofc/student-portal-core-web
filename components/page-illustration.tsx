import Image from "next/image";
import Illustration from "@/public/images/page-illustration.svg";
import BlurredShapeGray from "@/public/images/blurred-shape-gray.svg";
import BlurredShape from "@/public/images/blurred-shape.svg";

export default function PageIllustration({
  multiple = false,
}: {
  multiple?: boolean;
}) {
  return (
    <>
      {}
      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-0
          -z-10
          -translate-x-1/4
          opacity-90
          transition-all
          duration-500
        "
        aria-hidden="true"
      >
        <Image
          className="max-w-none"
          src={Illustration}
          width={846}
          height={594}
          alt="Ilustração da página"
        />
      </div>

      {multiple && (
        <>
          {}
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
              alt="Forma desfocada cinza"
            />
          </div>

          {}
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
              alt="Forma desfocada azul"
            />
          </div>
        </>
      )}
    </>
  );
}
