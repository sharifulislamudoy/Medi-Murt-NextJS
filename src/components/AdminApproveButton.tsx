"use client";

import { useRouter } from "next/navigation";

export default function AdminApproveButton({
  userId,
}: {
  userId: string;
}) {
  const router = useRouter();

  const handleApprove = async () => {
    await fetch("/api/admin/approve", {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
    router.refresh();
  };

  return (
    <button onClick={handleApprove}>
      Approve
    </button>
  );
}