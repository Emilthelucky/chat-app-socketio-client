import { useState, useEffect } from "react";
import axios from "axios";
import socket from "@/socketio/socket";
import {
  Box,
  Input,
  Button,
  Text,
  Select,
  Spinner,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { useAuth } from "@/pages/_app";

const API_URL = process.env.API_URL;

const Dashboard: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [chat, setChat] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsersAndUser = async () => {
      if (!currentUser) return;

      setLoading(true);
      try {
        const userResponse = await axios.get(`${API_URL}/api/me/users`);
        setUsers(userResponse.data);

        if (selectedUser) {
          const chatResponse = await axios.post(`${API_URL}/api/chat/get`, {
            firstUserId: currentUser._id,
            secondUserId: selectedUser,
          });
          setChat(chatResponse.data);
          setMessages(chatResponse.data.messages);
        }
      } catch (error) {
        setError("Error fetching data.");
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsersAndUser();
  }, [selectedUser, currentUser]);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Socket connected");
    });

    socket.on("newMessage", (updatedChat) => {
      setMessages(updatedChat.messages);
    });

    return () => {
      socket.off("newMessage");
    };
  }, []);

  const handleSendMessage = async () => {
    if (message.trim() === "" || !chat || !currentUser) return;

    const newMessage = {
      _id: Math.random().toString(36).substr(2, 9),
      message,
      user: currentUser._id,
      createdAt: new Date().toISOString(),
    };

    setMessages([...messages, newMessage]);
    setMessage("");

    try {
      await axios.post(`${API_URL}/api/message/create`, {
        id: chat._id,
        message,
        userId: currentUser._id,
      });
    } catch (error) {
      setError("Error sending message.");
      console.error("Error sending message:", error);
    }
  };

  return (
    <Box maxW="md" mx="auto" p={4} borderWidth={1} borderRadius="lg">
      {loading ? (
        <Box textAlign="center" py={4}>
          <Spinner size="lg" />
        </Box>
      ) : (
        <>
          {error && (
            <Alert status="error" mb={4}>
              <AlertIcon />
              {error}
            </Alert>
          )}
          <Box
            mb={4}
            p={4}
            borderWidth={1}
            borderRadius="md"
            height="400px"
            overflowY="scroll"
            bg="gray.50"
          >
            {messages.map((msg) => (
              <Box
                key={msg._id}
                mb={2}
                p={2}
                borderRadius="md"
                bg={msg.user === currentUser?._id ? "blue.50" : "gray.200"}
                alignSelf={
                  msg.user === currentUser?._id ? "flex-end" : "flex-start"
                }
              >
                <Text fontWeight="bold">
                  {msg.user === currentUser?._id
                    ? "You"
                    : users.find((u) => u._id === msg.user)?.username || "User"}
                </Text>
                <Text>{msg.message}</Text>
              </Box>
            ))}
          </Box>
          <Select
            placeholder="Select user"
            onChange={(e) => setSelectedUser(e.target.value)}
            mb={4}
          >
            {users.map(
              (user) =>
                currentUser?.username !== user.username && (
                  <option key={user._id} value={user._id}>
                    {user.username}
                  </option>
                )
            )}
          </Select>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message"
            mb={2}
          />
          <Button colorScheme="teal" onClick={handleSendMessage}>
            Send
          </Button>
        </>
      )}
    </Box>
  );
};

export default Dashboard;
