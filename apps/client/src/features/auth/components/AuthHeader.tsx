import Image from "next/image";

interface AuthHeaderProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function AuthHeader({ title, subtitle, children }: AuthHeaderProps) {
  return (
    <div className="text-center mb-8">
      <div className="flex justify-center mb-4">
        <Image
          src="/logo.svg"
          alt="Recto Logo"
          width={120}
          height={64}
          priority
        />
      </div>
      {title && (
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          {title}
        </h2>
      )}
      {subtitle && (
        <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
      )}
      {children}
    </div>
  );
}
