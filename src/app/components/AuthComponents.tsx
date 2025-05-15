import { Eye, EyeOff } from "lucide-react";

interface AuthButtonProps {
  type?: "submit" | "button";
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}

export const AuthButton = ({
  type = "button",
  onClick,
  className = "",
  children,
}: AuthButtonProps) => (
  <button
    type={type}
    onClick={onClick}
    className={`w-full py-2 px-4 rounded-full font-semibold transition
                ${className}`}
  >
    {children}
  </button>
);

export const AuthInput = ({
  type = "text",
  placeholder,
  value,
  onChange,
  required = true,
}: {
  type?: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    required={required}
    className="px-4 py-2 rounded-lg border text-gray-700 border-gray-300 
              focus:outline-none focus:ring-2 focus:ring-blue-500 
              bg-white/90 backdrop-blur-sm w-full"
  />
);

export const AuthLayout = ({ children }: { children: React.ReactNode }) => (
  <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-yellow-200">
    <div className="w-full max-w-md px-4">{children}</div>
  </main>
);

export const PasswordInput = ({
  value,
  onChange,
  showPassword,
  togglePassword,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showPassword: boolean;
  togglePassword: () => void;
}) => (
  <div className="relative w-full">
    <AuthInput
      type={showPassword ? "text" : "password"}
      placeholder="Password"
      value={value}
      onChange={onChange}
    />
    <button
      type="button"
      onClick={togglePassword}
      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 
                 rounded-full text-gray-500 hover:text-gray-700 
                 transition-colors"
      aria-label={showPassword ? "Hide password" : "Show password"}
    >
      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
    </button>
  </div>
);
