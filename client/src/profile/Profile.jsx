import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import generalStyle from "../App.module.css";
import style from "./Profile.module.css";
import profileImg from "../images/aboutMe/aboutMeImg3.jpg";

function closeProfile() {
  const profile = document.getElementById("profile");
  if (profile) {
    profile.classList.toggle(generalStyle.showProfile);
  }
}

const hystoryData = [
  {
    name: "Маникюр с покрытием",
    id: 1,
    price: 1500,
  },
  {
    name: "Маникюр с покрытием + укрепление",
    id: 2,
    price: 1700,
  },
  {
    name: "Маникюр с покрытием + починка ногтей",
    id: 3,
    price: 1600,
  },
];

function Profile() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoginForm, setIsLoginForm] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    phone_number: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  // Создаём массив data на основе user
  const data = user
    ? [
        {
          name: user.full_name || "Не указано",
          id: 1,
        },
        {
          name: user.phone_number || "Не указано",
          id: 2,
        },
        {
          name: user.email || "Не указано",
          id: 3,
        },
      ]
    : [];

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
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user:", error);
        localStorage.removeItem("token");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8000/register", formData);
      localStorage.setItem("token", response.data.access_token);
      const userResponse = await axios.get("http://localhost:8000/users/me", {
        headers: { Authorization: `Bearer ${response.data.access_token}` },
      });
      setUser(userResponse.data);
    } catch (error) {
      console.error("Registration error:", error);
      alert("Ошибка регистрации: " + (error.response?.data?.detail || "Неизвестная ошибка сервера"));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
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
      const userResponse = await axios.get("http://localhost:8000/users/me", {
        headers: { Authorization: `Bearer ${response.data.access_token}` },
      });
      setUser(userResponse.data);
    } catch (error) {
      console.error("Login error:", error);
      alert("Ошибка входа: " + (error.response?.data?.detail || "Неизвестная ошибка сервера"));
    }
  };

  const toggleForm = () => {
    setIsLoginForm(!isLoginForm);
    setFormData({ full_name: "", phone_number: "", email: "", password: "" });
  };

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  if (!user) {
    return (
      <div id="profile" className={`${generalStyle.container} ${style.profileContainer}`}>
        <div onClick={closeProfile} className={style.closeProfile}>
          Закрыть
        </div>
        <div>
          <div>
            <h2>{isLoginForm ? "Вход" : "Регистрация"}</h2>
            <form onSubmit={isLoginForm ? handleLogin : handleRegister}>
              {!isLoginForm && (
                <>
                  <div>
                    <label>ФИО</label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label>Номер телефона</label>
                    <input
                      type="tel"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </>
              )}
              <div>
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700">Пароль</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <button type="submit">{isLoginForm ? "Войти" : "Зарегистрироваться"}</button>
            </form>
            <button onClick={toggleForm}>{isLoginForm ? "К регистрации" : "Войти"}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="profile" className={`${generalStyle.container} ${style.profileContainer}`}>
      <div onClick={closeProfile} className={style.closeProfile}>
        Закрыть
      </div>
      <img className={style.profileImg} src={profileImg} alt="" />
      <div className={style.profileInfo}>
        {data.map((item) => (
          <div key={item.id} className={style.profileItem}>
            {item.name}
          </div>
        ))}
      </div>
      <div className={style.profileHystory}>
        <h2>История посещений</h2>
        <div className={style.profileHystoryWrapper}>
          {hystoryData.map((item) => (
            <div key={item.id} className={style.hystoryItem} id={item.id}>
              <p>Услуга: {item.name}</p>
              <p>Цена: {item.price} руб.</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Profile;