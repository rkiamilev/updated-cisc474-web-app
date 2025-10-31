import Image, { type ImageProps } from "next/image";
import { Button } from "@repo/ui/button";
import styles from "./page.module.css";
import Link from "next/link";

// type Props = Omit<ImageProps, "src"> & {
//     srcLight: string;
//     srcDark: string;
// };

// const ThemeImage = (props: Props) => {
//     const { srcLight, srcDark, ...rest } = props;

//     return (
//         <>
//             <Image {...rest} src={srcLight} className="imgLight" />
//             <Image {...rest} src={srcDark} className="imgDark" />
//         </>
//     );
// };

export default function Home() {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Welcome to Next.js!</h1>
            <p className={styles.description}>
                Get started by editing <code className={styles.code}>apps/web/app/page.tsx</code>
            </p>
            <div className={styles.buttons}>
                <Link href="/about">
                    <Button variant="primary">About Page</Button>
                </Link>
                <Link href="/dashboard">
                    <Button variant="secondary">Dashboard Page</Button>
                </Link>
            </div>
        </div>
    );
}
