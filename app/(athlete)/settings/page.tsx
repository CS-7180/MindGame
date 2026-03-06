"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Brain,
    ArrowLeft,
    Shield,
    ShieldCheck,
    Eye,
    EyeOff,
    Trash2,
    AlertTriangle,
    Bell,
} from "lucide-react";
import { toast } from "sonner";

import { JoinTeamCard } from "@/components/settings/JoinTeamCard";

export default function SettingsPage() {
    const router = useRouter();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== "DELETE") return;
        setIsDeleting(true);

        try {
            const res = await fetch("/api/account/delete", {
                method: "DELETE",
            });
            const json = await res.json();

            if (!res.ok) {
                throw new Error(json.error?.message || "Failed to delete account");
            }

            toast.success("Account deleted successfully");
            router.push("/login");
            router.refresh();
        } catch (err: unknown) {
            toast.error("Failed to delete account", {
                description: err instanceof Error ? err.message : "Unknown error",
            });
        } finally {
            setIsDeleting(false);
            setShowDeleteDialog(false);
            setDeleteConfirmText("");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
            {/* Header */}
            <header className="p-4 flex items-center gap-3 border-b border-slate-800/50">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push("/home")}
                    className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-full"
                    data-testid="back-to-home"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25">
                        <Brain className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-bold text-white text-lg">Settings</span>
                </div>
            </header>

            <main className="p-4 max-w-lg mx-auto space-y-8 pb-12">
                {/* Join Team Section */}
                <section>
                    <JoinTeamCard />
                </section>

                {/* Privacy Summary */}
                <section className="pt-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Shield className="h-5 w-5 text-indigo-400" />
                        <h2 className="text-lg font-bold text-white">Privacy & Data</h2>
                    </div>

                    <Card className="border-slate-800 bg-gradient-to-br from-slate-900/90 to-indigo-950/30 backdrop-blur-sm overflow-hidden">
                        <CardContent className="p-5 space-y-4">
                            {/* Private by Default */}
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-emerald-500/10 mt-0.5">
                                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">Private by Default</p>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        All your mental prep data — anxiety scores, performance ratings,
                                        reflections, and routine logs — is private and visible only to you.
                                    </p>
                                </div>
                            </div>

                            <Separator className="bg-slate-800/50" />

                            {/* Coach Access */}
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-amber-500/10 mt-0.5">
                                    <Eye className="h-4 w-4 text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">Coach Visibility</p>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        If you&apos;re on a coach&apos;s roster, they can only see your name
                                        and whether you have an active routine. They cannot see your scores,
                                        ratings, or notes.
                                    </p>
                                </div>
                            </div>

                            <Separator className="bg-slate-800/50" />

                            {/* No Public Profiles */}
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-indigo-500/10 mt-0.5">
                                    <EyeOff className="h-4 w-4 text-indigo-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">No Public Profiles</p>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        There are no public profiles, leaderboards, or social sharing features.
                                        Your data never leaves your private account.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Notifications Section */}
                <section className="pt-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Bell className="h-5 w-5 text-indigo-400" />
                        <h2 className="text-lg font-bold text-white">Notifications</h2>
                    </div>

                    <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-sm overflow-hidden">
                        <CardContent className="p-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-white">Game Reminders</p>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Configure push notifications for upcoming games
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-600"
                                    onClick={() => router.push("/settings/notifications")}
                                >
                                    Manage
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Danger Zone */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="h-5 w-5 text-red-400" />
                        <h2 className="text-lg font-bold text-white">Danger Zone</h2>
                    </div>

                    <Card className="border-red-900/30 bg-red-950/10 backdrop-blur-sm overflow-hidden">
                        <CardContent className="p-5 space-y-4">
                            {/* Delete Individual Entries */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-white">Delete Log Entries</p>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Remove individual game log entries from your history
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-600"
                                    onClick={() => router.push("/log/pre")}
                                    data-testid="delete-entries-link"
                                >
                                    View History
                                </Button>
                            </div>

                            <Separator className="bg-red-900/20" />

                            {/* Delete Account */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-red-400">Delete Account</p>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Permanently delete your account and all data. This cannot be undone.
                                    </p>
                                </div>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setShowDeleteDialog(true)}
                                    className="bg-red-600 hover:bg-red-700"
                                    data-testid="delete-account-button"
                                >
                                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                                    Delete
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </section>
            </main>

            {/* Delete Account Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={(open) => {
                if (!open && !isDeleting) {
                    setShowDeleteDialog(false);
                    setDeleteConfirmText("");
                }
            }}>
                <AlertDialogContent className="bg-slate-900 border-slate-800 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-red-400">
                            <AlertTriangle className="h-5 w-5" />
                            Delete Your Account
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400 space-y-3">
                            <span className="block">
                                This will permanently delete your account and ALL associated data including:
                            </span>
                            <span className="block text-sm">
                                • All routines and routine steps<br />
                                • All game logs and reflections<br />
                                • Your athlete profile and preferences<br />
                                • All scheduled games and reminders
                            </span>
                            <span className="block font-medium text-red-400">
                                This action is permanent and irreversible.
                            </span>
                            <span className="block text-sm mt-3">
                                Type <span className="font-mono font-bold text-white bg-slate-800 px-1.5 py-0.5 rounded">DELETE</span> to confirm:
                            </span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <Input
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder="Type DELETE to confirm"
                        className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-red-500 focus:ring-red-500/20"
                        data-testid="delete-confirm-input"
                        autoComplete="off"
                    />

                    <AlertDialogFooter>
                        <AlertDialogCancel
                            disabled={isDeleting}
                            className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700 hover:text-white"
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleDeleteAccount();
                            }}
                            disabled={isDeleting || deleteConfirmText !== "DELETE"}
                            className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                            data-testid="delete-account-confirm"
                        >
                            {isDeleting ? "Deleting..." : "Permanently Delete Account"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
