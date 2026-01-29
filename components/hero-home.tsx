import VideoThumb from "@/public/images/hero-image-01.jpg";
import ModalVideo from "@/components/modal-video";

export default function HeroHome() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="py-16 md:py-24">
          {}
          <div className="mx-auto max-w-4xl pb-14 text-center md:pb-20">
            <h1
              className="
                animate-[gradient_6s_linear_infinite]
                bg-[linear-gradient(to_right,#bfdbfe,#93c5fd,#e0f2fe,#60a5fa,#bfdbfe)]
                bg-[length:200%_auto]
                bg-clip-text
                pb-6
                font-nacelle
                text-4xl
                font-semibold
                leading-tight
                text-transparent
                md:text-5xl
                lg:text-6xl
              "
              data-aos="fade-up"
            >
              Aprenda programação na prática e construa sua carreira em tecnologia
            </h1>

            <p
              className="
                mx-auto
                mb-10
                max-w-3xl
                text-lg
                leading-relaxed
                text-blue-200/80
                md:text-xl
              "
              data-aos="fade-up"
              data-aos-delay={200}
            >
              Aulas ao vivo, projetos reais e acompanhamento direto para você
              sair do zero ou evoluir como desenvolvedor front-end, back-end
              ou full stack.
            </p>

            {}
            <div
              className="flex justify-center"
              data-aos="fade-up"
              data-aos-delay={400}
            >
              <a
                href="#matricula"
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

          {}
          <ModalVideo
            thumb={VideoThumb}
            thumbWidth={1104}
            thumbHeight={576}
            thumbAlt="Apresentação da escola de programação"
            video="videos/video.mp4"
            videoWidth={1920}
            videoHeight={1080}
          />
        </div>
      </div>
    </section>
  );
}
