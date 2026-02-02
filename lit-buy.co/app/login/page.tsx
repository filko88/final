"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [signupError, setSignupError] = useState<{ code?: string; message?: string } | null>(null)
    const [loginError, setLoginError] = useState<{ code?: string; message?: string } | null>(null)
    const formRef = useRef<HTMLFormElement | null>(null)

    const getFriendlyAuthError = (
        error: { code?: string; message?: string },
        context: "login" | "signup"
    ) => {
        const code = error.code || ""
        if (code === "weak_password") {
            return "Password should be at least 6 characters."
        }
        if (code === "email_address_invalid") {
            return "Please enter a valid email address."
        }
        if (code === "email_not_confirmed") {
            return "Please confirm your email before signing in."
        }
        if (code === "invalid_login_credentials") {
            return "Invalid email or password."
        }
        if (context === "signup") {
            return error.message || "Signup failed. Please try again."
        }
        return error.message || "Login failed. Please try again."
    }

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setLoginError(null)

        const formData = new FormData(e.currentTarget)
        const email = formData.get("email") as string
        const password = formData.get("password") as string

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setLoading(false)
            console.error(error)
            setLoginError({ code: error.code, message: error.message })
            toast.error("Login failed", { description: error.message })
            return
        }

        router.push("/admin")
        router.refresh()
    }

    const handleSignUp = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        const form = formRef.current
        if (!form) {
            toast.error("Unable to submit form")
            return
        }

        setLoading(true)
        try {
            const formData = new FormData(form)
            const email = (formData.get("email") as string) || ""
            const password = (formData.get("password") as string) || ""
            if (!email || !password) {
                toast.error("Email and password required")
                return
            }

            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${location.origin}/auth/callback`,
                }
            })

            if (error) {
                setSignupError({ code: error.code, message: error.message })
                toast.error("Signup failed", { description: error.message })
                return
            }

            if (data.user) {
                toast.success("Account created", { description: "Awaiting admin approval." })
                router.push("/pending-approval")
                router.refresh()
                return
            }

            toast.success("Check your email", { description: "Confirmation link sent." })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 px-4">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Login</CardTitle>
                    <CardDescription>
                        Enter your email below to login to your account.
                    </CardDescription>
                </CardHeader>
                <form ref={formRef} onSubmit={handleLogin}>
                    <CardContent className="grid gap-4">
                        <div className="rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                            New accounts require admin approval before CMS access.
                        </div>
                        {loginError && (
                            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                                {getFriendlyAuthError(loginError, "login")}
                            </div>
                        )}
                        {signupError && (
                            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                                {getFriendlyAuthError(signupError, "signup")}
                            </div>
                        )}
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button className="w-full" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Sign in
                        </Button>
                        <div className="relative w-full">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">Or</span>
                            </div>
                        </div>
                        <Button type="button" variant="outline" className="w-full" onClick={handleSignUp} disabled={loading}>
                            Sign up
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
