"use client";

import { useEffect } from "react";
import { Container } from "@/components/shared/Container";
import { Button } from "@/components/shared/Button";
import { routes } from "@/lib/site";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="text-stat text-primary">Oops</p>
      <h1 className="text-section-title mt-2 text-ink">Something went wrong.</h1>
      <p className="mt-4 max-w-md text-lg leading-relaxed text-slate">
        We hit an unexpected problem loading this page. You can try again, or
        head back home while we sort it out.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Button onClick={reset} size="lg">
          Try again
        </Button>
        <Button href={routes.home} size="lg" variant="outline">
          Back to home
        </Button>
      </div>
    </Container>
  );
}
