import { beforeEach, describe, expect, it, vi } from "vitest";

const exchangeCodeForSession = vi.hoisted(() => vi.fn());

vi.mock("@/lib/supabase", () => ({
  createServerSupabase: async () => ({
    auth: { exchangeCodeForSession },
  }),
}));

describe("auth callback", () => {
  beforeEach(() => {
    vi.resetModules();
    exchangeCodeForSession.mockReset();
  });

  it("rejects a callback without a code", async () => {
    const { GET } = await import("../../apps/web/app/auth/callback/route");
    const response = await GET(new Request("http://localhost:3000/auth/callback"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/login?error=auth");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(exchangeCodeForSession).not.toHaveBeenCalled();
  });

  it("rejects a code Supabase does not accept", async () => {
    exchangeCodeForSession.mockResolvedValue({ error: { message: "bad code" } });
    const { GET } = await import("../../apps/web/app/auth/callback/route");
    const response = await GET(new Request("http://localhost:3000/auth/callback?code=nope"));

    expect(exchangeCodeForSession).toHaveBeenCalledWith("nope");
    expect(response.headers.get("location")).toBe("http://localhost:3000/login?error=auth");
  });

  it("sends a valid code back to the chat", async () => {
    exchangeCodeForSession.mockResolvedValue({ error: null });
    const { GET } = await import("../../apps/web/app/auth/callback/route");
    const response = await GET(new Request("http://localhost:3000/auth/callback?code=ok"));

    expect(response.headers.get("location")).toBe("http://localhost:3000/");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });
});
