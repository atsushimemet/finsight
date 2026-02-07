import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

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
      user_id: user.id,
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
