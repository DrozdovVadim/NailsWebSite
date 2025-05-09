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
const data=[
    {
        name: 'клиентов Клиент Клиентович',
        id: 1,
    },
    {
        name: '+7 (999) 999 99-99',
        id: 2,
    },
    {
        name: 'pochta.klienta@gmail.com',
        id: 3,
    }
]
const hystoryData=[
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
]
    
   


function Profile()
{
    return(
        <div id="profile"  className={generalStyle.container + " " + style.profileContainer}>
            <div onClick={()=> closeProfile()} className={style.closeProfile}>закрыть</div>
            <img className={style.profileImg} src={profileImg} alt="" />
            <div className={style.profileInfo}>
                {/* <div className={style.prodileItem+" "+style.profileName}>клиентов Клиент Клиентович</div>
                <div className={style.prodileItem+" "+style.profileNumber}>+7 (999) 999 99-99</div>
                <div className={style.prodileItem+" "+style.profileMail}>pochta.klienta@gmail.com</div> */}
                {
                    data.map((item, index)=> {
                        
                        return(
                            <div key={index} className={style.profileItem}>{item.name}</div>
                        )
                    })
                }
            </div>
            
            <div className={style.profileHystory}>
                <h2>История посещений</h2>
                <div className={style.profileHystoryWrapper}>
                    {
                        hystoryData.map((item, index)=>{
                            return(
                            <div className={style.hystoryItem}>
                             <p>Услуга: {item.name}</p>
                             <p>Цена: {item.price} руб.</p>
                            </div>
                        )})
                    }
                </div>
            </div>
        </div>
    )
}
export default Profile;