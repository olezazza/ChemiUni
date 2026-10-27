import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, API-Version, App-Version, App-Platform, App-Env",
};

const bodySchema = z.object({ pin: z.string().min(1).max(64) }).strict();

// Exchanges the demo PIN for a short-lived signed counselor token.
// Fails closed: without DEMO_COUNSELOR_PIN configured, no token is ever issued.
export const Route = createFileRoute("/api/public/counselor-pin")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers }),
      POST: async ({ request }) => {
        let pin: string;
        try {
          pin = bodySchema.parse(await request.json()).pin;
        } catch {
          return Response.json({ error: "Invalid request" }, { status: 400, headers });
        }
        const { issueCounselorToken } = await import("../../../lib/counselor-pin.server");
        const issued = issueCounselorToken(pin);
        if (!issued) {
          // Same answer for a wrong PIN and a missing secret: reveal nothing.
          return Response.json({ error: "Incorrect PIN" }, { status: 403, headers });
        }
        return Response.json(issued, { headers });
      },
    },
  },
});
