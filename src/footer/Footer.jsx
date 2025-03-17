import React from "react";
import generalStyle from "../App.module.css";
import style from "./Footer.module.css";
import logoTg from "../images/TelegramLogo.png"
import logoVk from "../images/vkLogo.png"
import logoWa from "../images/whatsappLogo.png"
import webLogo from "../images/logo.svg"


function Footer()
{
    return(
        <footer className={generalStyle.section+ " "+ style.footerSection}>
            <div className={generalStyle.container + " "+ style.footerContainer}>
                <div className={style.footerNav}>
                    <a href="">Галерея</a>
                    <a href="">Обо мне</a>
                    <a href="">Услуги</a>
                    <a href="">Конакты</a>
                    <a href="">Как добраться</a>
                    <a href="">Профиль</a>
                </div>
                <div className={style.footerContacts}>
                    <a href="tel:89999999999">8 (999) 999 99-99</a>
                </div>
                <div className={style.logoWrapper}>
                    <a href="https://telegram.org"><img src={logoTg} alt="logo" /></a>
                    <a href="https://vk.com"><img src={logoVk} alt="logo" /></a>
                    <a href="https://whatsapp.com"><img src={logoWa} alt="logo" /></a>
                </div>
                <img className={style.footerLogo} src={webLogo} alt="logo" />
            </div>
        </footer>
    )
}
export default Footer;
