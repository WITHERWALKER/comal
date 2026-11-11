"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ComponentType } from "react";

/**
 * Subconjunto estructural de `IconProps` de animate-ui. Al no fijar el tipo
 * de animación, los iconos con animaciones distintas siguen siendo
 * asignables entre sí.
 */
type ToggleIconComponent = ComponentType<{
  size?: number;
  className?: string;
  animate?: boolean;
  speed?: number;
  delay?: number;
}>;

type ToggleIconProps = {
  /** Icono que se muestra mientras el toggle está apagado. */
  icon: ToggleIconComponent;
  /**
   * Icono que se muestra mientras el toggle está encendido. Si se omite, se
   * mantiene el mismo icono y se transforma en el sitio, que es lo que hace
   * la mayoría de iconos de animate-ui.
   */
  activeIcon?: ToggleIconComponent;
  /** Estado actual del toggle. */
  active: boolean;
  size?: number;
  speed?: number;
  className?: string;
};

/**
 * Icono animado con comportamiento de toggle: al activarlo se reproduce la
 * animación y se queda en su estado final; al desactivarlo vuelve al estado
 * inicial.
 *
 * `active` debe venir de un estado real (un booleano), nunca de
 * `animateOnTap`/`animateOnHover`, porque esos disparadores vuelven al
 * reposo al soltar el puntero.
 */
export function ToggleIcon({
  icon: Icon,
  activeIcon: ActiveIcon,
  active,
  size = 28,
  speed,
  className,
}: ToggleIconProps) {
  if (!ActiveIcon) {
    return (
      <Icon animate={active} size={size} speed={speed} className={className} />
    );
  }

  return (
    <span
      className="relative inline-grid place-items-center"
      style={{ width: size, height: size }}
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.span
          key={active ? "on" : "off"}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.7 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="absolute inset-0 grid place-items-center"
        >
          {active ? (
            <ActiveIcon
              animate
              size={size}
              speed={speed}
              className={className}
            />
          ) : (
            <Icon size={size} speed={speed} className={className} />
          )}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
