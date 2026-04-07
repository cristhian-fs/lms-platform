import React from "react";
import { GraduationCap } from "lucide-react";
import { useScroll } from "motion/react";
import { AnimatedGroup } from "./animated-group";
import { Button } from "@lms-platform/ui/components/button";
import { Link } from "@tanstack/react-router";
import { cn } from "@lms-platform/ui/lib/utils";

const transitionVariants = {
  item: {
    hidden: {
      opacity: 0,
      filter: "blur(12px)",
      y: 12,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        type: "spring",
        bounce: 0.3,
        duration: 1.5,
      },
    },
  },
};

export function HeroSection() {
  return (
    <>
      <HeroHeader />
      <main className="overflow-hidden">
        <section>
          <div className="relative pt-24">
            <div className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--background)_75%)]"></div>
            <div className="mx-auto max-w-5xl px-6">
              <div className="sm:mx-auto lg:mr-auto">
                <AnimatedGroup
                  variants={{
                    container: {
                      visible: {
                        transition: {
                          staggerChildren: 0.05,
                          delayChildren: 0.75,
                        },
                      },
                    },
                    ...transitionVariants,
                  }}
                >
                  <h1 className="mt-8 max-w-2xl text-balance text-5xl font-medium md:text-6xl lg:mt-16">
                    Aprenda no seu ritmo, acompanhe cada etapa da jornada
                  </h1>
                  <p className="mt-8 max-w-2xl text-pretty text-lg">
                    Cursos em vídeo estruturados com módulos, aulas e
                    acompanhamento de progresso em tempo real — para você saber
                    exatamente onde está e o que vem a seguir.
                  </p>
                </AnimatedGroup>
              </div>
            </div>
            <AnimatedGroup
              variants={{
                container: {
                  visible: {
                    transition: {
                      staggerChildren: 0.05,
                      delayChildren: 0.75,
                    },
                  },
                },
                ...transitionVariants,
              }}
            >
              <div className="relative -mr-56 mt-8 overflow-hidden px-2 sm:mr-0 sm:mt-12 md:mt-20">
                <div
                  aria-hidden
                  className="bg-gradient-to-b to-background absolute inset-0 z-10 from-transparent from-35%"
                />
                <div className="inset-shadow-2xs ring-background dark:inset-shadow-white/20 bg-background relative mx-auto max-w-5xl overflow-hidden rounded-2xl border p-4 shadow-lg shadow-zinc-950/15 ring-1">
                  <img
                    className="bg-background aspect-15/8 relative hidden rounded-2xl dark:block"
                    src="https://tailark.com/_next/image?url=%2Fmail2.png&w=3840&q=75"
                    alt="app screen"
                    width="2700"
                    height="1440"
                  />
                  <img
                    className="z-2 border-border/25 aspect-15/8 relative rounded-2xl border dark:hidden"
                    src="https://tailark.com/_next/image?url=%2Fmail2-light.png&w=3840&q=75"
                    alt="app screen"
                    width="2700"
                    height="1440"
                  />
                </div>
              </div>
            </AnimatedGroup>
          </div>
        </section>
        <section className="bg-background pb-16 pt-16 md:pb-32">
          <div className="mx-auto max-w-5xl px-6">
            <p className="text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-10">
              Tudo o que você precisa para aprender de verdade
            </p>
            <div className="mx-auto grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4">
              {[
                { label: "Aulas em Vídeo", desc: "Assista as aulas no seu próprio ritmo" },
                { label: "Módulos Estruturados", desc: "Conteúdo organizado do início ao fim" },
                { label: "Progresso em Tempo Real", desc: "Saiba sempre onde você está" },
                { label: "Matrículas", desc: "Matricule-se e retome quando quiser" },
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center text-center gap-2 p-4 rounded-xl border border-border/50">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-primary">{item.label}</span>
                  <span className="text-xs text-muted-foreground">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

const menuItems = [
  { name: "Cursos", href: "#courses" },
  { name: "Funcionalidades", href: "#features" },
  { name: "Planos", href: "#pricing" },
  { name: "Sobre", href: "#about" },
];

export const HeroHeader = () => {
  const [menuState, setMenuState] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  const { scrollYProgress } = useScroll();

  React.useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      setScrolled(latest > 0.05);
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  return (
    <header>
      <nav
        data-state={menuState && "active"}
        className={cn(
          "group fixed z-20 w-full border-b transition-colors duration-150",
          scrolled && "bg-background/50 backdrop-blur-3xl",
        )}
      >
        <div className="mx-auto max-w-5xl px-6 transition-all duration-300">
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
            <div className="flex w-full items-center justify-between gap-12 lg:w-auto">
              <Link
                to="/"
                aria-label="home"
                className="flex items-center space-x-2"
              >
                <GraduationCap />
                LMS Platform
              </Link>
            </div>
            <div className="bg-background group-data-[state=active]:block lg:group-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
              <div className="lg:hidden">
                <ul className="space-y-6 text-base">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      <Link
                        to={item.href}
                        className="text-muted-foreground hover:text-accent-foreground block duration-150"
                      >
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                <Button asChild variant="outline" size="sm">
                  <Link to="/login">
                    <span>Entrar</span>
                  </Link>
                </Button>
                <Button asChild size="sm">
                  <Link to="/sign-up">
                    <span>Cadastrar</span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
