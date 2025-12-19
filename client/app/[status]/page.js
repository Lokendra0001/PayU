"use client";

import { useParams, useSearchParams } from "next/navigation";

const Page = () => {
  const { status } = useParams();
  const searchParams = useSearchParams();

  const txnid = searchParams.get("txnid");
  const payuid = searchParams.get("payuid");
  const error = searchParams.get("error");

  const isSuccess = status === "success";

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-md w-full border rounded-lg shadow-lg p-8 text-center">
        {isSuccess ? (
          <>
            <div className="text-green-600 text-5xl mb-4">✅</div>
            <h1 className="text-2xl font-bold mb-4">Payment Successful</h1>
            <p className="text-gray-700 mb-2">Transaction ID: <span className="font-mono">{txnid}</span></p>
            <p className="text-gray-700 mb-4">Payment ID: <span className="font-mono">{payuid}</span></p>
            <p className="text-gray-600">Thank you for your payment. Your transaction has been processed successfully.</p>
          </>
        ) : (
          <>
            <div className="text-red-600 text-5xl mb-4">❌</div>
            <h1 className="text-2xl font-bold mb-4">Payment Failed</h1>
            <p className="text-gray-700 mb-2">Transaction ID: <span className="font-mono">{txnid}</span></p>
            <p className="text-gray-700 mb-2">Error: <span className="font-mono">{error || "Unknown error"}</span></p>
            <p className="text-gray-600">Unfortunately, your transaction could not be completed. Please try again or contact support.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default Page;
