import React from "react";
import "swiper/css"
import "swiper/css/effect-fade";
import style from "./aboutMe.module.css";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from "swiper/modules";
import generalStyle from "../App.module.css";
import aboutMeImg1 from "../images/aboutMeImg.jpg";
import aboutMeImg2 from "../images/aboutMeImg2.jpg";
import aboutMeImg3 from "../images/aboutMeImg3.jpg";
import aboutMeImg4 from "../images/aboutMeImg4.jpg";

const data = [
  {
    id: 1,
    src: aboutMeImg1,
  },
  {
    id: 2,
    src: aboutMeImg2,
  },
  {
    id: 3,
    src: aboutMeImg3,
  },
  {
    id: 4,
    src: aboutMeImg4,
  },
];


function AboutMe()
{
    return(
        <div id="title2" className={generalStyle.section+ " "+ style.aboutMeSection}>
            <div className={generalStyle.container+ " "+style.aboutMeContainer}>
                <h2 className={generalStyle.sectionTitle}>Пару слов о себе</h2>
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
                        </SwiperSlide>
                        ))}
                    </Swiper>
                    
                </div>
            </div>
        </div>
    );
    
}
export default AboutMe;