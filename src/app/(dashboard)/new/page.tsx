import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { NewApplicationForm } from "@/components/dashboard/NewApplicationForm";

export default async function NewApplicationPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">新規案件作成</h1>
      <NewApplicationForm userId={user.id} />
    </div>
  );
}
