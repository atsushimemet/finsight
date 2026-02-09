import { createClient } from "@/lib/supabase/server";
import { GUEST_USER_ID } from "@/lib/constants";
import { NewApplicationForm } from "@/components/dashboard/NewApplicationForm";

export default async function NewApplicationPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id ?? GUEST_USER_ID;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">新規案件作成</h1>
      <NewApplicationForm userId={userId} />
    </div>
  );
}
