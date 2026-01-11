import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";
import styles from "./button.module.scss";

const buttonVariants = cva(
  styles.button,
  {
    variants: {
      variant: {
        solid: styles.solid,
        outline: styles.outline,
        glass: styles.glass,
        ghost: styles.ghost,
        tab: styles.tab,
      },
      size: {
        sm: styles.sm,
        md: styles.md,
        lg: styles.lg,
        xl: styles.xl,
        icon: styles.icon,
        tab: styles.tabSize,
      },
    },
    defaultVariants: {
      variant: "solid",
      size: "md",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };
