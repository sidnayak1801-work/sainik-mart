import { Link } from "react-router-dom";

import styles from "./pages.module.css";

type Props = {
  to: string;
  title: string;
  description: string;
};

export const DashboardQuickLink = ({ to, title, description }: Props) => {
  return (
    <Link to={to} className={styles.card}>
      <h2>{title}</h2>
      <p>{description}</p>
    </Link>
  );
};
