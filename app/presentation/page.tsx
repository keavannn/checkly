import { redirect } from "next/navigation";

// The presentation now lives on the home page; keep the old address working.
export default function PresentationRedirect() {
  redirect("/");
}
