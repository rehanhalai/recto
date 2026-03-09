import Link from "next/link";

interface AuthFooterProps {
  mode: "login" | "signup";
}

export function AuthFooter({ mode }: AuthFooterProps) {
  const isLogin = mode === "login";
  const linkHref = isLogin ? "/signup" : "/login";
  const linkText = isLogin ? "Sign up here" : "Sign in here";
  const questionText = isLogin
    ? "Don't have an account?"
    : "Already have an account?";

  return (
    <>
      <p className="mt-6 text-center text-xs text-muted-foreground">
        {questionText}{" "}
        <Link
          href={linkHref}
          className="font-medium text-black hover:text-black transition-colors"
        >
          {linkText}
        </Link>
      </p>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        By {isLogin ? "signing in" : "signing up"}, you agree to our{" "}
        <Link
          href="#"
          className="underline underline-offset-4 hover:text-foreground"
        >
          terms of service
        </Link>{" "}
        and{" "}
        <Link
          href="#"
          className="underline underline-offset-4 hover:text-foreground"
        >
          privacy policy
        </Link>
        .
      </p>
    </>
  );
}
