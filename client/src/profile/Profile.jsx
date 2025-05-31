import React, { useState } from "react";
import generalStyle from "../App.module.css";
import style from "./Profile.module.css";
import profileImg from "../images/aboutMe/aboutMeImg2.jpg";
import { useUser } from "../context/UserContext"; // Импортируем хук

function closeProfile() {
  const profile = document.getElementById("profile");
  if (profile) {
    profile.classList.toggle(generalStyle.showProfile); // Переключаем класс showProfile
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

function Profile({ onClose }) {
  const { user, data, isLoading, handleRegister, handleLogin, logout } = useUser(); // Используем функции из контекста
  const [isLoginForm, setIsLoginForm] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    phone_number: "",
    email: "",
    password: "",
    role: false,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLoginForm) {
        await handleLogin(formData, onClose); // Вызываем handleLogin из контекста
      } else {
        await handleRegister(formData, onClose); // Вызываем handleRegister из контекста
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
        <div className={style.logoutBtn} onClick={logout}>Выйти</div>
      </div>
    );
  }

  return (
    <div id="profile" className={`${generalStyle.container} ${style.profileContainer} ${style.unloginProfileCont}`}>
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
          <a onClick={toggleForm}>{isLoginForm ? "Зарегистрировать профиль" : "Войти"}</a>
        </div>
      </div>
    </div>
  );
}

export default Profile;