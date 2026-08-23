import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";

const ARCSCAN_API = "https://testnet.arcscan.app/api";

type ArcScanTransaction = {
  timeStamp?: string;
  blockNumber?: string;
  hash?: string;
};

type ArcScanResponse = {
  status?: string;
  message?: string;
  result?: ArcScanTransaction[] | string;
};

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address")?.trim();
  if (!address || !isAddress(address)) {
    return NextResponse.json({ error: "Invalid wallet address" }, { status: 400 });
  }

  const query = new URLSearchParams({
    module: "account",
    action: "txlist",
    address,
    startblock: "0",
    endblock: "99999999",
    page: "1",
    offset: "1",
    sort: "asc",
  });

  try {
    const response = await fetch(`${ARCSCAN_API}?${query.toString()}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return NextResponse.json({ bornOnArc: null, source: "arcscan", available: false }, { status: 200 });
    }

    const payload = await response.json() as ArcScanResponse;
    const transactions = Array.isArray(payload.result) ? payload.result : [];
    const first = transactions[0];
    const unixSeconds = first?.timeStamp ? Number(first.timeStamp) : 0;

    if (!Number.isFinite(unixSeconds) || unixSeconds <= 0) {
      return NextResponse.json({ bornOnArc: null, source: "arcscan", available: true });
    }

    return NextResponse.json({
      bornOnArc: unixSeconds,
      blockNumber: first.blockNumber ?? null,
      transactionHash: first.hash ?? null,
      source: "arcscan",
      available: true,
    });
  } catch {
    return NextResponse.json({ bornOnArc: null, source: "arcscan", available: false });
  }
}
