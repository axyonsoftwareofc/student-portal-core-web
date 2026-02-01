// app/(default)/page.tsx

export const metadata = {
    title: "Code Plus",
    description: "Page description",
};

import Header from "@/components/ui/header";
import PageIllustration from "@/components/page-illustration";
import Hero from "@/components/hero-home";
import Workflows from "@/components/workflows";
import Features from "@/components/features";
import Testimonials from "@/components/testimonials";
import Cta from "@/components/cta";

export default function Home() {
    return (
        <>
            <Header />
            <PageIllustration />
            <Hero />
            <Workflows />
            <Features />
            <Testimonials />
            <Cta />
        </>
    );
}