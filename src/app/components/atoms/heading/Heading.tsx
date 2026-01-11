import { Heading as RadixUiHeading, type HeadingProps } from "@radix-ui/themes";
import classNames from "classnames";
import styles from "./styles.module.scss";

type Props = {
  isUnderLined?: boolean;
} & HeadingProps;

export const Heading = ({
  as,
  children,
  className,
  isUnderLined = false,
  ...rest
}: Props) => (
  <RadixUiHeading
    as={as}
    size="9"
    weight="regular"
    className={classNames(styles.heading, className)}
    {...rest}
  >
    <span className={styles.children}>{children}</span>
    {isUnderLined && <span className={styles.underline} />}
  </RadixUiHeading>
);
