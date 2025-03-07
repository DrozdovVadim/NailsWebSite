import React from "react";
import style from "./formSection.module.css"
import generalStyle from "../App.module.css"
import formImg from "../images/formImg.jpg"

function FormSection()
{
    return(
        <div className={generalStyle.section + " "+ style.formSection}>
            <div className={generalStyle.container + " " + style.formContainer}>
                <h2 className={generalStyle.sectionTitle}>Сходи на маникюр</h2>
                <div className={style.formContentWrapper}>
                    <form className={style.form} action="">
                        <input placeholder="Введите имя" type="text" />
                        <input placeholder="" type="text" />
                        <input type="text" />
                        <input className={style.formBtn} type="button" value={"Записаться!"} />
                    </form>
                    <img className={style.formImg} src={formImg} alt="img" />
                </div>
                
            </div>
        </div>
    )
}
export default FormSection;