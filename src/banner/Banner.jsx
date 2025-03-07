import React from "react";
import style from "./banner.module.css";
import generalStyle from "../App.module.css";
import nails from "../images/bannerImg.jpg";

function Banner() {
  return (
    <div className={generalStyle.section +" "+style.bannerSection}>
      
      <div className={generalStyle.container + " " + style.bannerContainer}>
      
        <div className={style.bannerText}>
          <h2 className={generalStyle.sectionTitle}>Выбирай Яркие дизайны</h2>
          <p className={style.bannerParagraph + " "+ style.firstP}>
            Привет, я Катя, и я специалист ногтевого сервиса. Со мной клиент
            всегда уверен в идеальном исполнении своих желаний! 💅✨
          </p>
          <p className={style.bannerParagraph}>
            Я создаю не просто маникюр, а маленькие произведения искусства,
            которые подчеркнут твою индивидуальность и добавят уверенности в
            каждом движении. Доверь свои ногти профессионалу, и я сделаю так,
            чтобы ты чувствовала себя особенной каждый день. Запишись на
            процедуру, и давай вместе сделаем твои ручки безупречными! 💖
          </p>
          <a className={style.bannerText__btn} href="#">Записать на маникюр</a>
        </div>
        <img src={nails} alt="nailPhoto" />
      </div>
    </div>
  );
}
export default Banner;