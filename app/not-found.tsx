import type { Metadata } from "next";
import { Container } from "@/components/shared/Container";
import { Button } from "@/components/shared/Button";
import { routes } from "@/lib/site";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="text-stat text-primary">404</p>
      <h1 className="text-section-title mt-2 text-ink">
        This page isn’t here yet.
      </h1>
      <p className="mt-4 max-w-md text-lg leading-relaxed text-slate">
        The page you’re looking for may have moved, or we may still be building
        it. Let’s get you back on track.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Button href={routes.home} size="lg">
          Back to home
        </Button>
        <Button href={routes.projects} size="lg" variant="outline">
          Explore our programmes
        </Button>
      </div>
    </Container>
  );
}
