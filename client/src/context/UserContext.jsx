import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// Создаем контекст
const UserContext = createContext();

// Провайдер контекста
export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Загружаем данные пользователя при монтировании
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get("http://localhost:8000/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = response.data;
        setUser(userData);
        // Обновляем data на основе ответа
        setData([
          {
            name: userData.FullName || "Не указано",
            id: 1,
          },
          {
            name: userData.PhoneNumber || "Не указано",
            id: 2,
          },
          {
            name: userData.Email || "Не указано",
            id: 3,
          },
        ]);
      } catch (error) {
        console.error("Error fetching user:", error);
        localStorage.removeItem("token");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Функция для обновления пользователя
  const updateUser = (userData, email, phone_number) => {
    setUser(userData);
    setData([
      {
        name: userData.FullName || "Не указано",
        id: 1,
      },
      {
        name: phone_number || "Не указано",
        id: 2,
      },
      {
        name: email || "Не указано",
        id: 3,
      },
    ]);
  };

  // Функция для регистрации
  const handleRegister = async (formData, onClose) => {
    try {
      const response = await axios.post("http://localhost:8000/register", formData);
      localStorage.setItem("token", response.data.access_token);
      const { email, phone_number } = response.data;
      const userResponse = await axios.get("http://localhost:8000/users/me", {
        headers: { Authorization: `Bearer ${response.data.access_token}` },
      });
      updateUser(userResponse.data, email, phone_number);
      if (onClose) onClose(); // Закрываем модальное окно
    } catch (error) {
      console.error("Registration error:", error);
      throw new Error(error.response?.data?.detail || "Неизвестная ошибка сервера");
    }
  };

  // Функция для входа
  const handleLogin = async (formData, onClose) => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("username", formData.email);
      formDataToSend.append("password", formData.password);

      const response = await axios.post("http://localhost:8000/token", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      localStorage.setItem("token", response.data.access_token);
      const { email, phone_number } = response.data;
      const userResponse = await axios.get("http://localhost:8000/users/me", {
        headers: { Authorization: `Bearer ${response.data.access_token}` },
      });
      updateUser(userResponse.data, email, phone_number);
      if (onClose) onClose(); // Закрываем модальное окно
    } catch (error) {
      console.error("Login error:", error);
      throw new Error(error.response?.data?.detail || "Неизвестная ошибка сервера");
    }
  };

  // Функция для выхода
  const logout = () => {
    setUser(null);
    setData([]);
    localStorage.removeItem("token");
  };

  return (
    <UserContext.Provider value={{ user, data, isLoading, handleRegister, handleLogin, logout }}>
      {children}
    </UserContext.Provider>
  );
}

// Хук для использования контекста
export function useUser() {
  return useContext(UserContext);
}