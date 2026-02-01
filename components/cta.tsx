// components/cta.tsx

import Image from "next/image";
import BlurredShape from "@/public/images/blurred-shape.svg";

export default function Cta() {
    return (
        <section className="relative overflow-hidden">
            {/* Decorative blur shape */}
            <div
                className="pointer-events-none absolute bottom-0 left-1/2 -z-10 -mb-24 ml-20 -translate-x-1/2"
                aria-hidden="true"
            >
                <Image
                    className="max-w-none opacity-80"
                    src={BlurredShape}
                    width={760}
                    height={668}
                    alt="Forma desfocada decorativa"
                />
            </div>

            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <div className="rounded-2xl bg-linear-to-r from-transparent via-blue-900/40 py-14 md:py-20">
                    <div className="mx-auto max-w-3xl text-center">
                        <h2
                            className="
                animate-[gradient_6s_linear_infinite]
                bg-[linear-gradient(to_right,#bfdbfe,#93c5fd,#e0f2fe,#60a5fa,#bfdbfe)]
                bg-[length:200%_auto]
                bg-clip-text
                pb-8
                font-nacelle
                text-3xl
                font-semibold
                leading-tight
                text-transparent
                md:text-4xl
              "
                            data-aos="fade-up"
                        >
                            Comece agora sua jornada na programação
                        </h2>

                        {/* CTA Button */}
                        <div
                            className="flex justify-center"
                            data-aos="fade-up"
                            data-aos-delay={400}
                        >
                            <a
                                href="/signup"
                                className="
                  inline-flex
                  items-center
                  justify-center
                  rounded-lg
                  bg-linear-to-t
                  from-blue-500
                  to-blue-400
                  px-8
                  py-3
                  text-base
                  font-medium
                  text-white
                  shadow-lg
                  shadow-blue-500/30
                  transition
                  duration-300
                  hover:from-blue-400
                  hover:to-blue-300
                  focus:outline-none
                  focus-visible:ring
                  focus-visible:ring-blue-400
                "
                            >
                                Quero me matricular
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}