import { Redirect } from "expo-router";
import { ROUTES } from "@/constants/routes";

export default function RegisterRedirect() {
  return (
    <Redirect
      href={
        { pathname: ROUTES.AUTH.LOGIN, params: { mode: "register" } } as any
      }
    />
  );
}
