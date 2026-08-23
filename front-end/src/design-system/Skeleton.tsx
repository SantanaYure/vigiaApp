import styles from "./Skeleton.module.css";

interface SkeletonProps {
  height?: number;
  width?: string | number;
}

export function Skeleton({ height = 14, width = "100%" }: SkeletonProps) {
  return <div className={styles.block} style={{ height, width }} aria-hidden="true" />;
}
