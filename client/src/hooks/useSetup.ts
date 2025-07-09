import { useQuery } from "@tanstack/react-query";

export function useSetup() {
  const { data, isLoading } = useQuery({
    queryKey: ["/api/auth/setup"],
    retry: false,
  });

  return {
    needsSetup: (data as any)?.needsSetup ?? false,
    isLoading,
  };
}