import { UnauthenticatedError } from "eve/channels/auth";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getUser = vi.hoisted(() => vi.fn());
const createClient = vi.hoisted(() => vi.fn(() => ({ auth: { getUser } })));

vi.mock("@supabase/supabase-js", () => ({
  createClient,
}));

describe("supabaseAuth", () => {
  beforeEach(() => {
    vi.resetModules();
    getUser.mockReset();
    createClient.mockClear();
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  });

  it("lets a request without a bearer fall through", async () => {
    const { supabaseAuth } = await import("../../agent/lib/supabase-auth");
    const result = await supabaseAuth()(new Request("https://example.com/eve/v1/session"));

    expect(result).toBeNull();
    expect(createClient).not.toHaveBeenCalled();
  });

  it("rejects a bearer when Supabase is not configured", async () => {
    const { supabaseAuth } = await import("../../agent/lib/supabase-auth");

    await expect(supabaseAuth()(bearerRequest("token"))).rejects.toBeInstanceOf(UnauthenticatedError);
  });

  it("rejects a token Supabase does not accept", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_test";
    getUser.mockResolvedValue({ data: { user: null }, error: { message: "invalid" } });
    const { supabaseAuth } = await import("../../agent/lib/supabase-auth");

    await expect(supabaseAuth()(bearerRequest("bad"))).rejects.toBeInstanceOf(UnauthenticatedError);
    expect(getUser).toHaveBeenCalledWith("bad");
  });

  it("accepts a verified user on any session route", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co/";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_test";
    getUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
    const { supabaseAuth } = await import("../../agent/lib/supabase-auth");

    const result = await supabaseAuth()(bearerRequest("good"));

    expect(result).toEqual({
      attributes: {},
      authenticator: "supabase",
      issuer: "https://example.supabase.co/auth/v1",
      principalId: "user-1",
      principalType: "user",
      subject: "user-1",
    });
  });
});

function bearerRequest(token: string): Request {
  return new Request("https://example.com/eve/v1/session/session-1", {
    headers: { authorization: `Bearer ${token}` },
  });
}
