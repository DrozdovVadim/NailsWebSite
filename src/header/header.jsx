import React from "react";
import logo from "../images/logo.svg";
import nails from "../images/nailsbanner.png";

import generalStyle from "../App.module.css"
import style from "./header.module.css"

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


function Header() {
    return (
        <header className={style.header} >
            <div className={generalStyle.container +" "+ style.headerContainer}>
                <img src={logo} alt="logo" />
                <nav>
                    <ul className={style.headerNavList}>
                        {
                            navData.map((item) => {
                                return (
                                    <li className={style.headerListItem} key={item.id}>
                                        <a href={"#title"+item.id}>{item.name}</a>
                                    </li>
                                )
                            })
                        }
                    </ul>
                </nav>
            </div>
        </header>
    );
}

export default Header;