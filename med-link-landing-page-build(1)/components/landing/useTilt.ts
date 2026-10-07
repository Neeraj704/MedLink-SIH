"use client";

import { useMotionTemplate, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useCallback, type PointerEvent } from "react";
import { useMediaQuery, useReducedMotionPref } from "./useReducedMotionPref";

const SPRING = { stiffness: 170, damping: 26, mass: 0.9 };

export function useTilt(max = 10) {
  const { reduce } = useReducedMotionPref();
  const canHover = useMediaQuery("(hover: hover) and (pointer: fine)");
  const enabled = canHover && !reduce;

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const sx = useSpring(px, SPRING);
  const sy = useSpring(py, SPRING);
  const rotateY = useTransform(sx, [0, 1], [-max, max]);
  const rotateX = useTransform(sy, [0, 1], [max, -max]);
  const glareX = useTransform(sx, [0, 1], ["0%", "100%"]);
  const glareY = useTransform(sy, [0, 1], ["0%", "100%"]);
  const glare = useMotionTemplate`radial-gradient(420px circle at ${glareX} ${glareY}, rgba(255,255,255,0.22), transparent 55%)`;

  const onPointerMove = useCallback(
    (e: PointerEvent<HTMLElement>) => {
      if (!enabled) return;
      const rect = e.currentTarget.getBoundingClientRect();
      px.set((e.clientX - rect.left) / rect.width);
      py.set((e.clientY - rect.top) / rect.height);
    },
    [enabled, px, py],
  );
  const onPointerLeave = useCallback(() => {
    px.set(0.5);
    py.set(0.5);
  }, [px, py]);

  return {
    enabled,
    style: enabled ? { rotateX, rotateY, transformPerspective: 1000 } : undefined,
    glare,
    handlers: { onPointerMove, onPointerLeave },
  };
}
