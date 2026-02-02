import Link from "next/link"

export default function PendingApprovalPage() {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 px-4">
            <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-sm">
                <h1 className="text-2xl font-semibold tracking-tight">Account pending</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Your account was created successfully. An admin needs to grant CMS access before you can continue.
                </p>
                <div className="mt-6 flex gap-3">
                    <Link
                        href="/login"
                        className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium"
                    >
                        Back to login
                    </Link>
                </div>
            </div>
        </div>
    )
}
