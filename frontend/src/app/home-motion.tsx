
"use client";

import { motion, useReducedMotion } from "motion/react";

export function HeroEntrance({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reduceMotion ? 0 : 0.65,
        delay: reduceMotion ? 0 : delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

export function MotionCard({
  children,
  index = 0,
  className = "",
}: {
  children: React.ReactNode;
  index?: number;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.article
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      whileHover={reduceMotion ? undefined : { y: -5 }}
      transition={{
        duration: reduceMotion ? 0 : 0.5,
        delay: reduceMotion ? 0 : index * 0.09,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.article>
  );
}

export function OrbitRings() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      animate={reduceMotion ? undefined : { rotate: 360 }}
      transition={
        reduceMotion
          ? undefined
          : { duration: 36, repeat: Infinity, ease: "linear" }
      }
    >
      <div className="relative flex h-64 w-64 items-center justify-center rounded-full border border-cyan-100/55 md:h-80 md:w-80">
        <div className="absolute h-48 w-48 rounded-full border border-cyan-100/40 md:h-60 md:w-60" />
        <div className="absolute h-32 w-32 rounded-full border border-cyan-200/45 md:h-40 md:w-40" />
        <span className="absolute right-1 top-12 h-3 w-3 rounded-full bg-cyan-200 shadow-[0_0_16px_rgba(165,243,252,0.9)]" />
        <span className="absolute bottom-12 left-5 h-2 w-2 rounded-full bg-cyan-200 shadow-[0_0_12px_rgba(165,243,252,0.85)]" />
      </div>
    </motion.div>
  );
}


export function MotionButton({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      whileHover={reduceMotion ? undefined : { y: -2 }}
      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export function FloatingAccent() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.span
      className="absolute right-1 top-12 h-3 w-3 rounded-full bg-cyan-200 shadow-[0_0_16px_rgba(165,243,252,0.9)]"
      animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
      transition={
        reduceMotion
          ? undefined
          : { duration: 3, repeat: Infinity, ease: "easeInOut" }
      }
    />
  );
}
