import { AppProps } from "next/app";
import { useState, createContext, useContext, ReactNode } from "react";
import { Providers } from "@/providers/ChakraUI";
import "@/styles/globals.css";

interface User {
  _id?: string;
  username?: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  console.log(user);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Providers>
        <Component {...pageProps} />
      </Providers>
    </AuthProvider>
  );
}

export default MyApp;
export { useAuth };
