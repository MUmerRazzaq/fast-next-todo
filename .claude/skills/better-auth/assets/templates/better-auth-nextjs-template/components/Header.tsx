// skills/better-auth/assets/templates/better-auth-nextjs-template/components/Header.tsx
"use client";

import { UserButton } from "@daveyplate/better-auth-ui";
import Link from "next/link";

export function Header() {
    return (
        <header style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid #ccc' }}>
            <Link href="/">Home</Link>
            <UserButton />
        </header>
    );
}
