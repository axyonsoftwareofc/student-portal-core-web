"use client";

import Image, { StaticImageData } from "next/image";
import useMasonry from "@/utils/useMasonry";

import TestimonialImg01 from "@/public/images/testimonial-01.jpg";
import TestimonialImg02 from "@/public/images/testimonial-02.jpg";
import TestimonialImg03 from "@/public/images/testimonial-03.jpg";
import TestimonialImg04 from "@/public/images/testimonial-04.jpg";
import TestimonialImg05 from "@/public/images/testimonial-05.jpg";
import TestimonialImg06 from "@/public/images/testimonial-06.jpg";

interface Depoimento {
  img: StaticImageData;
  nome: string;
  cargo?: string;
  conteudo: string;
}

const depoimentos: Depoimento[] = [
  {
    img: TestimonialImg01,
    nome: "Lucas Andrade",
    cargo: "Aluno de Backend Java",
    conteudo:
      "Antes da escola eu não entendia nada de programação. Hoje consigo criar APIs com Spring Boot e já estou fazendo entrevistas.",
  },
  {
    img: TestimonialImg02,
    nome: "Mariana Souza",
    cargo: "Aluna de Front-end",
    conteudo:
      "A didática é absurda de boa. Tudo explicado do zero, com exemplos reais e projetos que fazem sentido.",
  },
  {
    img: TestimonialImg03,
    nome: "Rafael Lima",
    cargo: "Aluno Full Stack",
    conteudo:
      "Foi a primeira vez que programação realmente fez sentido pra mim. Hoje consigo criar sistemas completos.",
  },
  {
    img: TestimonialImg04,
    nome: "Camila Rocha",
    cargo: "Aluna iniciante",
    conteudo:
      "Eu tinha medo de código. As aulas são leves, práticas e sem enrolação. Recomendo demais.",
  },
  {
    img: TestimonialImg05,
    nome: "João Pedro",
    cargo: "Aluno de APIs REST",
    conteudo:
      "O foco em projetos reais mudou tudo. Não é só teoria, é código de verdade.",
  },
  {
    img: TestimonialImg06,
    nome: "Fernanda Alves",
    cargo: "Aluna de Programação",
    conteudo:
      "Além de ensinar programação, eles ensinam como pensar como dev. Isso faz toda a diferença.",
  },
];

export default function Testimonials() {
  const masonryContainer = useMasonry();

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6">
      <div className="border-t py-12 md:py-20">

        {}
        <div className="mx-auto max-w-3xl pb-12 text-center">
          <h2 className="pb-4 text-3xl font-semibold md:text-4xl">
            O que nossos alunos dizem
          </h2>
          <p className="text-lg text-indigo-200/65">
            Feedback real de quem está aprendendo programação do zero
            e construindo projetos de verdade.
          </p>
        </div>

        {}
        <div
          ref={masonryContainer}
          className="mx-auto grid max-w-sm gap-6 sm:max-w-none sm:grid-cols-2 lg:grid-cols-3"
        >
          {depoimentos.map((depoimento, index) => (
            <DepoimentoCard key={index} depoimento={depoimento} />
          ))}
        </div>
      </div>
    </section>
  );
}

function DepoimentoCard({
  depoimento,
}: {
  depoimento: Depoimento;
}) {
  return (
    <article className="rounded-2xl bg-gray-900/60 p-5 backdrop-blur">
      <div className="flex flex-col gap-4">

        <p className="text-indigo-200/70 before:content-['“'] after:content-['”']">
          {depoimento.conteudo}
        </p>

        <div className="flex items-center gap-3">
          <Image
            src={depoimento.img}
            width={40}
            height={40}
            alt={`Foto de ${depoimento.nome}`}
            className="rounded-full"
          />
          <div className="text-sm font-medium">
            <div className="text-gray-200">{depoimento.nome}</div>
            {depoimento.cargo && (
              <div className="text-gray-500">{depoimento.cargo}</div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
