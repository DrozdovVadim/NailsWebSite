import React from "react";
import logo from "../images/logo.svg";
import nails from "../images/nailsbanner.png";
import Profile from "../profile/Profile";
import generalStyle from "../App.module.css"
import style from "./header.module.css"
import menuIcon from "../images/menu-icon.svg"
const navData=[
    {
        id:1,
        name: "Галерея",
    },
    {
        id:2,
        name: "Обо мне",
    },
    {
        id:3,
        name: "Услуги",
    },
    {
        id:4,
        name: "Конакты",
    },
    {
        id:5,
        name: "Как добраться",
    },
    {
        id:6,
        name: "Профиль",
    },
]

function showProfile() {
    const profile = document.getElementById("profile");
    if (profile) {
        profile.classList.toggle(generalStyle.showProfile);
    }
}

const  showMenu = () => 
{
    const menu = document.getElementById("nav");
    if (menu)
    {
        menu.classList.toggle(style.showMenu)
    }
}

function Header() {
    return (
        <header className={style.header} >
            <div className={generalStyle.container +" "+ style.headerContainer}>
                <img src={logo} alt="logo" />
                <nav id="nav">
                    <ul className={style.headerNavList}>
                        {
                            navData.map((item, index) => {
                                const isLastItem = index === navData.length - 1;
                                return (
                                    <li className={style.headerListItem} key={item.id}>
                                        <a 
                                            href={"#title" + item.id}
                                            onClick={isLastItem ? () => showProfile() : null}
                                        >
                                            {item.name}
                                        </a>
                                    </li>
                                );
                            })
                        }
                    </ul>
                </nav>
                <img onClick={()=> showMenu()} className={style.menuIcon} src={menuIcon} alt="icon" />
            </div>
            <Profile/>
        </header>
    );
}

export default Header;