import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const createServerClient = vi.hoisted(() => vi.fn());

vi.mock("@supabase/ssr", () => ({
  createServerClient,
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

function request(pathname: string): NextRequest {
  return new NextRequest(new URL(pathname, "http://localhost:3000"));
}

function locationOf(response: Response): string {
  return response.headers.get("location") ?? "";
}

describe("updateSession", () => {
  beforeEach(() => {
    vi.resetModules();
    createServerClient.mockReset();
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  });

  it("sends chat routes to login when Supabase is not configured", async () => {
    const { updateSession } = await import("../../apps/web/lib/supabase");

    const home = await updateSession(request("/"));
    const session = await updateSession(request("/s/session-1"));
    const login = await updateSession(request("/login"));

    expect(home.status).toBe(307);
    expect(locationOf(home)).toBe("http://localhost:3000/login?error=config");
    expect(session.status).toBe(307);
    expect(locationOf(session)).toBe("http://localhost:3000/login?error=config");
    expect(login.status).toBe(200);
    expect(createServerClient).not.toHaveBeenCalled();
  });

  it("sends a signed-out visitor to login and a signed-in visitor home", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_test";
    mockClaims(null);
    const { updateSession } = await import("../../apps/web/lib/supabase");

    const home = await updateSession(request("/"));
    const thread = await updateSession(request("/s/session-1"));
    const login = await updateSession(request("/login"));

    expect(locationOf(home)).toBe("http://localhost:3000/login");
    expect(locationOf(thread)).toBe("http://localhost:3000/login");
    expect(login.status).toBe(200);
    expect(createServerClient).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "sb_publishable_test",
      expect.objectContaining({
        cookies: expect.objectContaining({ encode: "tokens-only" }),
      }),
    );
  });

  it("sends a signed-in visitor away from the login page", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_test";
    mockClaims({ sub: "user-1" });
    const { updateSession } = await import("../../apps/web/lib/supabase");

    const login = await updateSession(request("/login"));
    const chat = await updateSession(request("/s/session-1"));

    expect(login.status).toBe(307);
    expect(locationOf(login)).toBe("http://localhost:3000/");
    expect(chat.status).toBe(200);
  });

  it("keeps a refreshed session cookie on the login redirect", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_test";
    createServerClient.mockImplementation((_url, _key, options) => {
      options.cookies.setAll(
        [{ name: "sb-auth-token", value: "refreshed", options: { path: "/" } }],
        { "cache-control": "private, no-store", expires: "0", pragma: "no-cache" },
      );
      return { auth: { getClaims: async () => ({ data: { claims: null } }) } };
    });
    const { updateSession } = await import("../../apps/web/lib/supabase");

    const response = await updateSession(request("/"));

    expect(response.headers.get("set-cookie")).toContain("sb-auth-token=refreshed");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(response.headers.get("pragma")).toBe("no-cache");
  });
});

function mockClaims(claims: { sub: string } | null): void {
  createServerClient.mockReturnValue({
    auth: { getClaims: async () => ({ data: { claims } }) },
  });
}
