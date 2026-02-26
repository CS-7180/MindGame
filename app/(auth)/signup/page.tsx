"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Brain, Dumbbell, ClipboardList } from "lucide-react";

export default function SignupPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [role, setRole] = useState<"athlete" | "coach">("athlete");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const supabase = createClient();

        // 1. Sign up the user
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (signUpError) {
            setError(signUpError.message);
            setLoading(false);
            return;
        }

        if (!authData.user) {
            setError("Signup failed. Please try again.");
            setLoading(false);
            return;
        }

        // 2. Update the profile with role and display name
        const { error: profileError } = await supabase
            .from("profiles")
            .update({
                role,
                display_name: displayName || email.split("@")[0],
            })
            .eq("id", authData.user.id);

        if (profileError) {
            setError("Account created but profile setup failed. Please try logging in.");
            setLoading(false);
            return;
        }

        // 3. Redirect based on role
        if (role === "coach") {
            router.push("/coach/home");
        } else {
            router.push("/onboarding?step=1");
        }

        router.refresh();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 p-4">
            <Card className="w-full max-w-md border-slate-800 bg-slate-900/80 backdrop-blur-sm shadow-2xl">
                <CardHeader className="text-center space-y-4">
                    <div className="flex justify-center">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25">
                            <Brain className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-bold text-white">Create Your Account</CardTitle>
                        <CardDescription className="text-slate-400">
                            Start building your pre-game mental routine
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSignup} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="displayName" className="text-slate-300">Display Name</Label>
                            <Input
                                id="displayName"
                                type="text"
                                placeholder="Your name"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20"
                                data-testid="signup-name"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-300">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20"
                                data-testid="signup-email"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-300">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="At least 6 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20"
                                data-testid="signup-password"
                            />
                        </div>

                        <div className="space-y-3">
                            <Label className="text-slate-300">I am a...</Label>
                            <RadioGroup
                                value={role}
                                onValueChange={(v) => setRole(v as "athlete" | "coach")}
                                className="grid grid-cols-2 gap-3"
                                data-testid="signup-role"
                            >
                                <Label
                                    htmlFor="role-athlete"
                                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${role === "athlete"
                                            ? "border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10"
                                            : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                                        }`}
                                >
                                    <RadioGroupItem value="athlete" id="role-athlete" className="sr-only" />
                                    <Dumbbell className={`h-6 w-6 ${role === "athlete" ? "text-indigo-400" : "text-slate-500"}`} />
                                    <span className={`text-sm font-medium ${role === "athlete" ? "text-indigo-300" : "text-slate-400"}`}>
                                        Athlete
                                    </span>
                                </Label>
                                <Label
                                    htmlFor="role-coach"
                                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${role === "coach"
                                            ? "border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10"
                                            : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                                        }`}
                                >
                                    <RadioGroupItem value="coach" id="role-coach" className="sr-only" />
                                    <ClipboardList className={`h-6 w-6 ${role === "coach" ? "text-indigo-400" : "text-slate-500"}`} />
                                    <span className={`text-sm font-medium ${role === "coach" ? "text-indigo-300" : "text-slate-400"}`}>
                                        Coach
                                    </span>
                                </Label>
                            </RadioGroup>
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-900/30 border border-red-800 text-red-300 text-sm" data-testid="signup-error">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium shadow-lg shadow-indigo-500/25 transition-all duration-200"
                            data-testid="signup-submit"
                        >
                            {loading ? "Creating account..." : "Create Account"}
                        </Button>

                        <p className="text-center text-sm text-slate-400">
                            Already have an account?{" "}
                            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
