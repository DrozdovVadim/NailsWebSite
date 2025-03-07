import React from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from "swiper/modules";
import 'swiper/css';
import generalStyle from "../App.module.css"
import style from "./gallery.module.css"

const data=[
    {
        id: 1,
        img: "path"
    },
    {
        id: 2,
        img: "path"
    },
    {
        id: 3,
        img: "path"
    },
    {
        id: 4,
        img: "path"
    },
    {
        id: 5,
        img: "path"
    },
    {
        id: 6,
        img: "path"
    },
    
]

function Gallery()
{
    return(
        <div className={generalStyle.section + " "+ style.gallerySection}>
            <div className={generalStyle.container+ " "+ style.galleryContainer}>
                <h2 className={generalStyle.sectionTitle}>Галерея моих работ</h2>
                <Swiper className={style.imgWrapper}
                modules={[Autoplay]}
                slidesPerView={4}
                spaceBetween={40}
                autoplay={{
                    delay: 3500,
                    disableOnInteraction: false, 
                  }}
                loop={true}
                >
                    {
                        data.map((item)=> {
                            return(
                                <SwiperSlide key={item.id} className={style.imgItem}>
                                    {/* <img src="" alt="" /> */}
                                </SwiperSlide>
                            )
                            
                        })
                    }
                    
                </Swiper>
                <a className={style.galleryBtn} href="#">Посмотреть все работы</a>
            </div>
        </div>
    )
}
export default Gallery;