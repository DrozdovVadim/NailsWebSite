import React from "react";
import generalStyle from "../App.module.css";
import style from "./Profile.module.css";
import profileImg from "../images/aboutMeImg3.jpg";

function closeProfile()
{
    const profile = document.getElementById("profile");
    if (profile) {
        profile.classList.toggle(generalStyle.showProfile);
    }
}

function Profile()
{
    return(
        <div id="profile"  className={generalStyle.container + " " + style.profileContainer}>
            <div onClick={()=> closeProfile()} className={style.closeProfile}>закрыть</div>
            <img className={style.profileImg} src={profileImg} alt="" />
            <div className={style.profileInfo}>
                <div className={style.profileName}>клиентов Клиент Клиентович</div>
                <div className={style.profileNumber}>+7 (999) 999 99-99</div>
                <div className={style.profileMail}>pochta.klienta@gmail.com</div>
            </div>
            
            <div className={style.profileDescription}>
                <div>Описание</div>
                <div>Какой-то текст</div>
            </div>
        </div>
    )
}
export default Profile;