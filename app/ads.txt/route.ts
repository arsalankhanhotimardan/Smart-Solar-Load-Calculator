export const dynamic = "force-static";

export async function GET() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim() || "";
  if (!/^ca-pub-\d+$/.test(client)) {
    return new Response(
      "AdSense publisher ID is not configured yet.\n",
      {
        status: 404,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      }
    );
  }

  const publisherId = client.replace("ca-pub-", "pub-");
  return new Response(
    `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`,
    {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    }
  );
}
