import { createClient } from "@/lib/supabase/server";
import { GUEST_USER_ID } from "@/lib/constants";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id ?? GUEST_USER_ID;

  const body = await request.json();
  const {
    company_name,
    industry,
    loan_amount,
    loan_period,
    status = "draft",
    risk_level = "medium",
  } = body;

  if (!company_name || loan_amount == null || loan_period == null) {
    return NextResponse.json(
      { message: "company_name, loan_amount, loan_period are required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("loan_applications")
    .insert({
      user_id: userId,
      company_name,
      industry: industry ?? null,
      loan_amount: Number(loan_amount),
      loan_period: Number(loan_period),
      status,
      risk_level,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}
