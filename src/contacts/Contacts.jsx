import React from "react";
import generalStyle from "../App.module.css";
import style from "./Contacts.module.css"
import contactsImg from "../images/contactsImg.png"

function Contacts() {
    return(
        <div className={generalStyle.section+ " "+ style.ContactsSection}>
            <div className={generalStyle.container+ " "+ style.contactsContainer}>
                <div className={style.contactsText}>
                    <h2 className={generalStyle.sectionTitle}>Контакты</h2>
                    <div className={style.linksWrapper}>
                        <div className={style.linksWrapperItem}>
                            <div>Телефон</div>
                            <a href="tel:89999999999">8 (9999) 999 99-99</a>
                        </div>
                        <div className={style.linksWrapperItem}>
                            <div>Telegram</div>
                            <a href="https://telegram.org">telegram.org</a>
                        </div>
                        <div className={style.linksWrapperItem}>
                            <div>VK</div>
                            <a href="https://vk.com">VK</a>
                        </div>
                        <div className={style.linksWrapperItem}>
                            <div>Instagram</div>
                            <a href="https://instagram.com/ktrdrzd">instagram.com/ktrdrzd</a>
                        </div>
                        <div className={style.linksWrapperItem}>
                            <div>Галерея работ</div>
                            <a href="https://instagram.com/ktrdrzd">instagram.com/ktrdrzd</a>
                        </div>
                    </div>
                    <img src={contactsImg} alt="photo" />
                </div>
            </div>
        </div>
    )
}
export default Contacts;