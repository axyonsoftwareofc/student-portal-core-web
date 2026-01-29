"use client";

import { useState, useRef } from "react";
import type { StaticImageData } from "next/image";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import Image from "next/image";
import SecondaryIllustration from "@/public/images/secondary-illustration.svg";

interface ModalVideoProps {
  thumb: StaticImageData;
  thumbWidth: number;
  thumbHeight: number;
  thumbAlt: string;
  video: string;
  videoWidth: number;
  videoHeight: number;
}

export default function ModalVideo({
  thumb,
  thumbWidth,
  thumbHeight,
  thumbAlt,
  video,
  videoWidth,
  videoHeight,
}: ModalVideoProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div className="relative">
      {}
      <div
        className="pointer-events-none absolute bottom-10 left-1/2 -z-10 -ml-28 -translate-x-1/2 translate-y-1/2 opacity-70"
        aria-hidden="true"
      >
        <Image
          className="md:max-w-none"
          src={SecondaryIllustration}
          width={1165}
          height={1012}
          alt="Ilustração decorativa"
        />
      </div>

      {}
      <button
        type="button"
        className="
          group
          relative
          flex
          items-center
          justify-center
          rounded-2xl
          focus:outline-none
          focus-visible:ring
          focus-visible:ring-blue-400
        "
        onClick={() => setModalOpen(true)}
        aria-label="Assistir vídeo"
        data-aos="fade-up"
        data-aos-delay={200}
      >
        <figure
          className="
            relative
            overflow-hidden
            rounded-2xl
            before:absolute
            before:inset-0
            before:-z-10
            before:bg-linear-to-br
            before:from-blue-900
            before:via-blue-500/20
            before:to-blue-900
          "
        >
          <Image
            className="
              opacity-60
              grayscale
              transition
              duration-300
              group-hover:opacity-80
              group-hover:grayscale-0
            "
            src={thumb}
            width={thumbWidth}
            height={thumbHeight}
            priority
            alt={thumbAlt}
          />
        </figure>

        {}
        <span className="pointer-events-none absolute">
          <span
            className="
              relative
              flex
              items-center
              gap-3
              rounded-full
              bg-blue-950/80
              px-4
              py-2
              backdrop-blur
              transition
              duration-300
              group-hover:scale-105
            "
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-b from-blue-400 to-blue-600 shadow-lg shadow-blue-500/30">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={18}
                height={18}
                fill="none"
              >
                <path
                  fill="white"
                  d="M6 4.5v9l7-4.5-7-4.5Z"
                />
              </svg>
            </span>

            <span className="text-sm font-medium text-blue-100">
              Assistir apresentação
              <span className="text-blue-300/60"> · </span>
              3:47
            </span>
          </span>
        </span>
      </button>
      {}

      {}
      <Dialog
        initialFocus={videoRef}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 z-99999 bg-black/70 backdrop-blur-sm transition-opacity duration-300 data-closed:opacity-0"
        />

        <div className="fixed inset-0 z-99999 flex px-4 py-6 sm:px-6">
          <div className="mx-auto flex h-full max-w-6xl items-center">
            <DialogPanel
              transition
              className="
                aspect-video
                w-full
                overflow-hidden
                rounded-2xl
                bg-black
                shadow-2xl
                shadow-blue-500/20
                transition
                duration-300
                data-closed:scale-95
                data-closed:opacity-0
              "
            >
              <video
                ref={videoRef}
                width={videoWidth}
                height={videoHeight}
                controls
                autoPlay
              >
                <source src={video} type="video/mp4" />
                Seu navegador não suporta vídeo HTML5.
              </video>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
