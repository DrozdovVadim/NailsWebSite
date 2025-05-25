import React from "react";
import generalStyle from "../App.module.css";
import style from "./Contacts.module.css"
import contactsImg from "../images/contactsImg.png"

const data=[
    {
        id:1,
        text: 'Телефон',
        link: 'tel:89999999999',
        linkText: '8 (999) 999 99-99',
    },
    {
        id:2,
        text: 'Telegram',
        link: 'https://telegram.org',
        linkText: 'https://telegram.org',
    },
    {
        id:3,
        text: 'VK',
        link: 'https://vk.com',
        linkText: 'https://vk.com',
    },
    {
        id:4,
        text: 'Instagram',
        link: 'https://instagram.com/ktrdrzd',
        linkText: 'https://instagram.com/ktrdrzd',
    },
    {
        id:5,
        text: 'Галерея работ',
        link: 'https://instagram.com/ktrdrzd',
        linkText: 'https://instagram.com/ktrdrzd',
    },
]

function Contacts() {
    return(
        <div id="title4" className={generalStyle.section+ " "+ style.ContactsSection}>
            
            <div className={generalStyle.container+ " "+ style.contactsContainer}>
                <h2 className={generalStyle.sectionTitle}>Контакты</h2>
                <div className={style.contactsWrapper}>
                    
                    <div className={style.linksWrapper}>
                        {
                            data.map(item => {
                                return(
                                    <div className={style.linksWrapperItem} key={item.id}>
                                        <div>{item.text}</div>
                                        <a href={item.link}>{item.linkText}</a>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div> 
                
            </div>
        </div>
    )
}
export default Contacts;