// skills/better-auth/assets/templates/better-auth-nextjs-template/app/account/[...path]/page.tsx
import { AccountView } from "@daveyplate/better-auth-ui";
import { accountViewPaths } from "@daveyplate/better-auth-ui/server";

export function generateStaticParams() {
    return Object.values(accountViewPaths).map((path) => ({ path: [path] }));
}

export default function AccountPage({ params }: { params: { path: string[] } }) {
    const path = params.path.join('/');
    return (
        <main style={{ maxWidth: '800px', margin: 'auto', paddingTop: '50px' }}>
            <AccountView path={path} />
        </main>
    );
}
