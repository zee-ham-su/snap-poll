import { GET } from "./route";
import { NextRequest } from "next/server";

// @ts-ignore
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

jest.mock("@/lib/supabase-server", () => ({
  supabaseServer: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
  },
}));

const { supabaseServer } = require("@/lib/supabase-server");

function createRequest(url: string): NextRequest {
  return { url } as unknown as NextRequest;
}

describe("GET /api/my-polls", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch my polls (happy path)", async () => {
    const fakePolls = [
      { id: 1, title: "Poll 1", description: "desc", created_at: "2023-01-01" },
    ];
    supabaseServer.order.mockResolvedValueOnce({ data: fakePolls, error: null });
    const req = createRequest("http://localhost/api/my-polls?user_id=123");
    const res = await GET(req);
    const json = await res.json();
    expect(json.polls).toEqual(fakePolls);
    expect(supabaseServer.from).toHaveBeenCalledWith("polls");
    expect(supabaseServer.eq).toHaveBeenCalledWith("user_id", "123");
  });

  it("should return empty array if unauthorized (no user_id)", async () => {
    const req = createRequest("http://localhost/api/my-polls");
    const res = await GET(req);
    const json = await res.json();
    expect(json.polls).toEqual([]);
  });

  it("integration: should return polls for GET /api/my-polls", async () => {
    const fakePolls = [
      { id: 2, title: "Poll 2", description: "desc2", created_at: "2023-02-02" },
    ];
    supabaseServer.order.mockResolvedValueOnce({ data: fakePolls, error: null });
    const req = createRequest("http://localhost/api/my-polls?user_id=456");
    const res = await GET(req);
    const json = await res.json();
    expect(json.polls).toEqual(fakePolls);
  });
});
