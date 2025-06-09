import React, { useState, useEffect } from "react";
import generalStyle from "../App.module.css";
import style from "./Profile.module.css";
import defaultProfileImg from "/images/profileImg/default.jpg";
import { useUser } from "../context/UserContext";
import axios from "axios";

function closeProfile(onClose) {
  const profile = document.getElementById("profile");
  if (profile) {
    profile.classList.toggle(generalStyle.showProfile);
  }
}

function Profile({ onClose }) {
  const { user, data, isLoading, handleRegister, handleLogin, logout } = useUser();
  const [isLoginForm, setIsLoginForm] = useState(false);
  const [serviceHistory, setServiceHistory] = useState([]);
  const [formData, setFormData] = useState({
    full_name: "",
    phone_number: "",
    email: "",
    password: "",
    role: false,
  });
  const [profileImage, setProfileImage] = useState(defaultProfileImg);
  const [isDefaultImage, setIsDefaultImage] = useState(true);
    const [file, setFile] = useState(null);

  const ChangeFile = (e) => {
    const newFile = e.target.files[0]; 
    setFile(newFile);
  };

  const handleUploadImage = async (e) => {
    const newFile = e.target.files[0]; 
    setFile(newFile);
    if (!file ) {
      alert("Выберите файл и убедитесь, что user.id установлен.");
      return;
    }
    else if (!user?.id)
    {
      alert("UserID говна")
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", user.id);

      await axios.post("http://localhost:8000/upload-profile-image", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          // Не обязательно указывать Content-Type — axios сам выставит его правильно
        },
        params: {
        userId: user.id,
      },
      });

      setProfileImage(`/images/profileImg/${user.id}.jpg?${Date.now()}`);
      setIsDefaultImage(false);
    } catch (error) {
      console.error("Ошибка загрузки:", error.response?.data || error);
      alert("Ошибка при загрузке");
    }
  };

  useEffect(() => {
    if (user) {
      const fetchServiceHistory = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get(
            `http://localhost:8000/provided-services?userId=${user.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setServiceHistory(response.data);
        } catch (error) {
          console.error("Ошибка при загрузке истории посещений:", error);
          setServiceHistory([]);
        }
      };

      fetchServiceHistory();

      // Загружаем пользовательское изображение
      setProfileImage(`/images/profileImg/${user.id}.jpg?${Date.now()}`);
      setIsDefaultImage(false);
    }
  }, [user]);

  const handleImageError = () => {
    setProfileImage(defaultProfileImg);
    setIsDefaultImage(true);
  };





const handleImageDelete = async () => {
  try {
    const token = localStorage.getItem("token");

    await axios.delete(`http://localhost:8000/delete-profile-image`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        userId: user.id,
      },
    });

    setProfileImage(defaultProfileImg);
    setIsDefaultImage(true);
  } catch (error) {
    console.error("Ошибка при удалении изображения:", error);
    alert("Ошибка при удалении фотографии");
  }
};

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLoginForm) {
        await handleLogin(formData, onClose);
      } else {
        await handleRegister(formData, onClose);
      }
    } catch (error) {
      alert(`${isLoginForm ? "Ошибка входа" : "Ошибка регистрации"}: ${error.message}`);
    }
  };

  const toggleForm = () => {
    setIsLoginForm(!isLoginForm);
    setFormData({ full_name: "", phone_number: "", email: "", password: "", role: false });
  };

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  if (user) {
    return (
      <div id="profile" className={`${generalStyle.container} ${style.profileContainer}`}>
        <div onClick={() => closeProfile(onClose)} className={style.closeProfile}>
          Закрыть
        </div>
        <div className={style.profileImgCont}>
          <img
          className={style.profileImg}
          src={profileImage}
          alt="Profile"
          onError={handleImageError}
        />
        <div className={style.profileImageControls}>
          {isDefaultImage ? (
            <div className={style.inputCont}>
              <label htmlFor="fileInput" className={style.fileLabel}>
                📎 Прикрепить файл
              </label>
              <input
                id="fileInput"
                type="file"
                accept="image/*"
                onChange={handleUploadImage}
                className={style.fileInput}
              />
          </div>
          ) : (
            <div className={style.deleteBtn} onClick={handleImageDelete}>
              Удалить фото
            </div>
          )}
        </div>
        
        </div>
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
            {serviceHistory.map((item) => (
              <div key={item.id} className={style.hystoryItem} id={item.id}>
                <p>Услуга: {item.service_name}</p>
                <p>Цена: {item.price} руб.</p>
              </div>
            ))}
          </div>
        </div>
        <div className={style.logoutBtn} onClick={logout}>
          Выйти
        </div>
      </div>
    );
  }

  return (
    <div
      id="profile"
      className={`${generalStyle.container} ${style.profileContainer} ${style.unloginProfileCont}`}
    >
      <div onClick={() => closeProfile(onClose)} className={style.closeProfile}>
        Закрыть
      </div>
      <div className={style.registerForm}>
        <h2>{isLoginForm ? "Вход" : "Регистрация"}</h2>
        <form onSubmit={onSubmit}>
          {!isLoginForm && (
            <div className={style.authorForm}>
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
            </div>
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
          <div>
            <label>Пароль</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button className={style.profileSubmitBtn} type="submit">
            {isLoginForm ? "Войти" : "Зарегистрироваться"}
          </button>
        </form>
        <div className={style.profileToggleForm}>
          {isLoginForm ? <span></span> : <span>Есть профиль? </span>}
          <a onClick={toggleForm}>
            {isLoginForm ? "Зарегистрировать профиль" : "Войти"}
          </a>
        </div>
      </div>
    </div>
  );
}

export default Profile;
