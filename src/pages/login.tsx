import { useState, useEffect } from "react";
import { useAuth } from "@/pages/_app";
import {
  Button,
  Input,
  FormControl,
  FormLabel,
  Box,
  Text,
} from "@chakra-ui/react";
import axios from "axios";
import { useRouter } from "next/router";
import socket from "@/socketio/socket";

const API_URL = process.env.API_URL;

const Login: React.FC = () => {
  const { setUser } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage("Please enter both email and password");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/user/login`, {
        email,
        password,
      });

      setUser(response.data);

      socket.emit("registerUser", response.data._id);

      router.push("/");
    } catch (error) {
      setErrorMessage("Error logging in.");
      console.error("Error logging in:", error);
    }

    setSuccessMessage("Login successful!");
    setErrorMessage(null);
    setEmail("");
    setPassword("");
  };

  return (
    <Box maxW="sm" mx="auto" p={4} borderWidth={1} borderRadius="lg">
      <FormControl mb={4}>
        <FormLabel>Email</FormLabel>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
        />
      </FormControl>
      <FormControl mb={4}>
        <FormLabel>Password</FormLabel>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
        />
      </FormControl>
      <Button colorScheme="teal" onClick={handleLogin}>
        Login
      </Button>
      <Box mt={4}>
        <Text color="red.500">{errorMessage}</Text>
        <Text color="green.500">{successMessage}</Text>
      </Box>
    </Box>
  );
};

export default Login;
