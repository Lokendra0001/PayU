"use client";

import { useParams, useSearchParams } from "next/navigation";

const Page = () => {
  const { status } = useParams();
  const searchParams = useSearchParams();
  const txnid = searchParams.get("txnid");

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }} className="bg-zinc-900 h-screen ">
      {status === "success" ? (
        <>
          <h2 style={{ color: "green" }}>Payment Successful ✅</h2>
          <p><b>Transaction ID:</b> {txnid}</p>
        </>
      ) : (
        <>
          <h2 style={{ color: "red" }}>Payment Failed ❌</h2>
          <p><b>Transaction ID:</b> {txnid}</p>
        </>
      )}
    </div>
  );
};

export default Page;
