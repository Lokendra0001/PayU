"use client";

import { useParams, useSearchParams } from "next/navigation";

const Page = () => {
  const { status } = useParams();
  const searchParams = useSearchParams();

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }} className="bg-zinc-900 h-screen ">
      {status === "success" ? (
        <>
          <h2 style={{ color: "green" }}>Payment Successful ✅</h2>

        </>
      ) : (
        <>
          <h2 style={{ color: "red" }}>Payment Failed ❌</h2>

        </>
      )}
    </div>
  );
};

export default Page;
