"use client";

import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { SignOut, User, Buildings } from "@phosphor-icons/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function UserMenu() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  };

  if (isPending) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
      </div>
    );
  }

  if (!session) {
    return (
      <Button asChild variant="outline" size="sm">
        <a href="/login">Sign in</a>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-sm">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-800">
                <User size={16} className="text-gray-600 dark:text-gray-400" />
                <span className="font-medium">{session.user?.name || session.user?.email}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{session.user?.email}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {session.session?.activeOrganizationId && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-blue-100 dark:bg-blue-900/30">
                  <Buildings size={16} className="text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                    Active Org
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Organization ID: {session.session.activeOrganizationId}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleSignOut}
        className="gap-2"
      >
        <SignOut size={16} />
        <span className="hidden sm:inline">Sign out</span>
      </Button>
    </div>
  );
}
