import styles from "./pages.module.css";

type Props = {
  title: string;
  description?: string;
};

export const AdminPageHeader = ({ title, description }: Props) => {
  return (
    <header className={styles.header}>
      <h1>{title}</h1>
      {description ? <p>{description}</p> : null}
    </header>
  );
};
