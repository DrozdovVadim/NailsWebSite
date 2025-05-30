import React from "react";
import "swiper/css"
import "swiper/css/effect-fade";
import style from "./aboutMe.module.css";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from "swiper/modules";
import generalStyle from "../App.module.css";
import axios from "axios";


// Динамический импорт всех изображений из папки ../images/aboutMe/
const images = import.meta.glob("../images/aboutMe/*.{jpg,jpeg,png,gif}", {
  eager: true,
  import: "default",
});

// Преобразование импортированных изображений в массив объектов
const data = Object.keys(images).map((path, index) => ({
  id: index + 1,
  src: images[path],
}));

const deletePhoto = async(photoSrc) =>
{
    try{
            const req= await axios.delete('http://localhost:8001/delete-from-about-me',
        {data: {src: photoSrc}}
    )
    }
    catch (err)
    {
        console.log(err)

    }


}

function AboutMe()
{
    return(
        <div id="title2" className={generalStyle.section+ " "+ style.aboutMeSection}>
            <div className={generalStyle.container+ " "+style.aboutMeContainer}>
                <h2 className={generalStyle.sectionTitle +" "+ style.aboutMeTitle}>Пару слов о себе</h2>
                <div className={style.aboutMeContent}>
                    <p className={style.aboutMeText}>
                        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Fuga eligendi dignissimos itaque laudantium exercitationem corrupti hic iste, dolor, modi corporis sint ea eum libero suscipit quibusdam nam eaque soluta facere. Lorem ipsum, dolor sit amet consectetur adipisicing elit. Fuga eligendi dignissimos itaque laudantium exercitationem corrupti hic iste, dolor, modi corporis sint ea eum libero suscipit quibusdam nam eaque soluta facere.
                    </p>
                    <Swiper
                        className={style.swiper}
                        modules={[Autoplay, EffectFade]}
                        effect="fade"
                        speed={1000}
                        slidesPerView={1}
                        autoplay={{
                        delay: 3500,
                        }}
                        loop={true}
                    >
                        {data.map((item) => (
                        <SwiperSlide key={item.id} className={style.swiperSlide}>
                            <img className={style.aboutMeImg} src={item.src} alt="photo" />
                            <a onClick={() => deletePhoto(item.src)} className={style.deletePhoto}>удалить</a>
                        </SwiperSlide>
                        ))}
                    </Swiper>
                    
                </div>
            </div>
        </div>
    );
    
}
export default AboutMe;