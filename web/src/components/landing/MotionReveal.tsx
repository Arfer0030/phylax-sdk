"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
};

type StaggerGroupProps = {
  children: ReactNode;
  className?: string;
  delayChildren?: number;
  stagger?: number;
};

type StaggerItemProps = {
  children: ReactNode;
  className?: string;
  y?: number;
};

export function Reveal({ children, className, delay = 0, y = 28 }: RevealProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={{
        opacity: 0,
        y: reduceMotion ? 0 : y,
        filter: reduceMotion ? "none" : "blur(8px)",
      }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.22 }}
      transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerGroup({
  children,
  className,
  delayChildren = 0,
  stagger = 0.08,
}: StaggerGroupProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.18 }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            delayChildren,
            staggerChildren: stagger,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className, y = 28 }: StaggerItemProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      variants={{
        hidden: {
          opacity: 0,
          y: reduceMotion ? 0 : y,
          filter: reduceMotion ? "none" : "blur(8px)",
        },
        visible: {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
