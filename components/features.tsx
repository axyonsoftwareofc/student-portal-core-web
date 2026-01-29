import Image from "next/image";
import BlurredShapeGray from "@/public/images/blurred-shape-gray.svg";
import BlurredShape from "@/public/images/blurred-shape.svg";
import FeaturesImage from "@/public/images/features.png";

export default function Features() {
  return (
    <section className="relative">
      {}
      <div
        className="pointer-events-none absolute left-1/2 top-0 -z-10 -mt-20 -translate-x-1/2"
        aria-hidden="true"
      >
        <Image
          className="max-w-none opacity-70"
          src={BlurredShapeGray}
          width={760}
          height={668}
          alt="Forma decorativa"
        />
      </div>

      <div
        className="pointer-events-none absolute bottom-0 left-1/2 -z-10 -mb-80 -translate-x-[120%] opacity-40"
        aria-hidden="true"
      >
        <Image
          className="max-w-none"
          src={BlurredShape}
          width={760}
          height={668}
          alt="Forma decorativa"
        />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="border-t py-14 [border-image:linear-gradient(to_right,transparent,--theme(--color-blue-400/.25),transparent)1] md:py-24">
          {}
          <div className="mx-auto max-w-3xl pb-6 text-center md:pb-14">
            <div className="inline-flex items-center gap-3 pb-3 before:h-px before:w-8 before:bg-linear-to-r before:from-transparent before:to-blue-300/60 after:h-px after:w-8 after:bg-linear-to-l after:from-transparent after:to-blue-300/60">
              <span className="inline-flex bg-linear-to-r from-blue-500 to-blue-300 bg-clip-text text-sm font-medium text-transparent">
                Diferenciais
              </span>
            </div>

            <h2
              className="
                animate-[gradient_6s_linear_infinite]
                bg-[linear-gradient(to_right,#bfdbfe,#93c5fd,#e0f2fe,#60a5fa,#bfdbfe)]
                bg-[length:200%_auto]
                bg-clip-text
                pb-4
                font-nacelle
                text-3xl
                font-semibold
                leading-tight
                text-transparent
                md:text-4xl
              "
              data-aos="fade-up"
            >
              Muito mais que aulas de programação
            </h2>

            <p className="text-lg text-blue-200/80">
              Um ensino focado em prática, projetos reais e acompanhamento para
              você evoluir rápido e com segurança.
            </p>
          </div>

          {}
          <div
            className="flex justify-center pb-8 md:pb-14"
            data-aos="fade-up"
          >
            <Image
              className="max-w-none rounded-xl shadow-xl shadow-blue-500/10"
              src={FeaturesImage}
              width={1104}
              height={384}
              alt="Plataforma de ensino"
            />
          </div>

          {}
          <div className="mx-auto grid max-w-sm gap-12 sm:max-w-none sm:grid-cols-2 md:gap-x-14 md:gap-y-16 lg:grid-cols-3">
            {[
              {
                title: "Aulas ao vivo e gravadas",
                text:
                  "Participe de aulas ao vivo com interação direta ou assista às gravações quando quiser, no seu ritmo.",
              },
              {
                title: "Projetos do mundo real",
                text:
                  "Desenvolva aplicações completas que simulam desafios reais do mercado e enriquecem seu portfólio.",
              },
              {
                title: "Acompanhamento individual",
                text:
                  "Suporte próximo para tirar dúvidas, revisar código e acelerar sua evolução como dev.",
              },
              {
                title: "Conteúdo sempre atualizado",
                text:
                  "Tecnologias modernas como React, Angular, Node, Java e Spring, alinhadas ao mercado atual.",
              },
              {
                title: "Preparação para o mercado",
                text:
                  "Apoio com currículo, GitHub, LinkedIn e entrevistas técnicas.",
              },
              {
                title: "Comunidade ativa",
                text:
                  "Faça parte de uma comunidade de alunos, troque experiências e evolua junto com outros desenvolvedores.",
              },
            ].map((feature, index) => (
              <article key={index}>
                <h3 className="mb-2 font-nacelle text-base font-semibold text-blue-100">
                  {feature.title}
                </h3>
                <p className="text-blue-200/75">{feature.text}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
